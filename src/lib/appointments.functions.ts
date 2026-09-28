import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { timeStringToMinutes } from "@/lib/booking";

const createSchema = z.object({
  serviceId: z.string().uuid(),
  barberId: z.string().uuid(),
  startsAt: z.string().min(10),
  customerName: z.string().trim().min(2).max(120),
  customerPhone: z.string().trim().min(8).max(30),
  notes: z.string().trim().max(500).optional(),
});

function randomCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i += 1) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `AG-${out}`;
}

/**
 * Cria o agendamento no servidor. O preço e a duração vêm sempre do banco,
 * nunca do navegador, e o conflito de horários é revalidado aqui.
 */
export const createAppointment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => createSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const [{ data: service, error: serviceError }, { data: settings }, { data: barber }] = await Promise.all([
      supabase
        .from("services")
        .select("id,price_cents,duration_minutes,active,name")
        .eq("id", data.serviceId)
        .single(),
      supabase
        .from("settings")
        .select("buffer_minutes,min_hours_ahead,max_days_ahead")
        .eq("id", 1)
        .single(),
      supabase.from("barbers").select("id,name,active").eq("id", data.barberId).single(),
    ]);

    if (serviceError || !service || !service.active) {
      return { ok: false as const, message: "Este serviço não está mais disponível." };
    }
    if (!barber || !barber.active) {
      return { ok: false as const, message: "Este barbeiro não está mais disponível." };
    }

    const buffer = settings?.buffer_minutes ?? 0;
    const minHoursAhead = settings?.min_hours_ahead ?? 2;
    const maxDaysAhead = settings?.max_days_ahead ?? 60;

    const startsAt = new Date(data.startsAt);
    if (Number.isNaN(startsAt.getTime())) {
      return { ok: false as const, message: "Horário inválido. Escolha outro horário." };
    }
    const endsAt = new Date(startsAt.getTime() + service.duration_minutes * 60_000);

    const hoursAhead = (startsAt.getTime() - Date.now()) / 3_600_000;
    if (hoursAhead < minHoursAhead) {
      return {
        ok: false as const,
        message: `Agendamentos precisam de no mínimo ${minHoursAhead}h de antecedência.`,
      };
    }
    if (hoursAhead / 24 > maxDaysAhead) {
      return { ok: false as const, message: `Só aceitamos agendamentos com até ${maxDaysAhead} dias de antecedência.` };
    }

    // Expediente da barbearia no dia da semana
    const weekday = startsAt.getDay();
    const { data: hours } = await supabase
      .from("business_hours")
      .select("is_open,opens_at,closes_at")
      .eq("weekday", weekday)
      .maybeSingle();
    if (!hours || !hours.is_open) {
      return { ok: false as const, message: "A barbearia não abre nesse dia." };
    }
    const startMinute = startsAt.getHours() * 60 + startsAt.getMinutes();
    const endMinute = startMinute + service.duration_minutes;
    if (startMinute < timeStringToMinutes(hours.opens_at) || endMinute > timeStringToMinutes(hours.closes_at)) {
      return { ok: false as const, message: "Esse horário está fora do expediente." };
    }

    // Escala do barbeiro
    const { data: schedule } = await supabase
      .from("barber_schedules")
      .select("works,starts_at,ends_at")
      .eq("barber_id", data.barberId)
      .eq("weekday", weekday)
      .maybeSingle();
    if (schedule && (!schedule.works || startMinute < timeStringToMinutes(schedule.starts_at) || endMinute > timeStringToMinutes(schedule.ends_at))) {
      return { ok: false as const, message: "Este barbeiro não atende nesse horário." };
    }

    const windowStart = new Date(startsAt.getTime() - (service.duration_minutes + buffer + 240) * 60_000);
    const windowEnd = new Date(endsAt.getTime() + (buffer + 240) * 60_000);

    const [{ data: conflicts }, { data: blocks }] = await Promise.all([
      supabase
        .from("appointments")
        .select("starts_at,ends_at")
        .eq("barber_id", data.barberId)
        .in("status", ["aguardando", "confirmado", "em_atendimento"])
        .gte("starts_at", windowStart.toISOString())
        .lte("starts_at", windowEnd.toISOString()),
      supabase
        .from("blocked_times")
        .select("starts_at,ends_at,barber_id")
        .lt("starts_at", windowEnd.toISOString())
        .gt("ends_at", windowStart.toISOString()),
    ]);

    const bufferedStart = startsAt.getTime() - buffer * 60_000;
    const bufferedEnd = endsAt.getTime() + buffer * 60_000;
    const clashes = (ranges: { starts_at: string; ends_at: string }[] | null | undefined) =>
      (ranges ?? []).some(
        (r) => bufferedStart < new Date(r.ends_at).getTime() && new Date(r.starts_at).getTime() < bufferedEnd,
      );

    if (clashes(conflicts)) {
      return { ok: false as const, message: "Esse horário acabou de ser reservado. Escolha outro, por favor." };
    }
    if (clashes((blocks ?? []).filter((b) => !b.barber_id || b.barber_id === data.barberId))) {
      return { ok: false as const, message: "Esse horário está bloqueado na agenda." };
    }

    let inserted: { id: string; code: string } | null = null;
    for (let attempt = 0; attempt < 3 && !inserted; attempt += 1) {
      const { data: row, error } = await supabase
        .from("appointments")
        .insert({
          code: randomCode(),
          customer_id: userId,
          customer_name: data.customerName,
          customer_phone: data.customerPhone,
          barber_id: data.barberId,
          service_id: data.serviceId,
          starts_at: startsAt.toISOString(),
          ends_at: endsAt.toISOString(),
          price_cents: service.price_cents,
          status: "confirmado",
          notes: data.notes ?? null,
        })
        .select("id,code")
        .single();
      if (!error && row) inserted = row;
      else if (error && !error.message.includes("duplicate")) {
        return { ok: false as const, message: "Não conseguimos concluir o agendamento. Tente novamente." };
      }
    }

    if (!inserted) {
      return { ok: false as const, message: "Não conseguimos concluir o agendamento. Tente novamente." };
    }

    await supabase.from("profiles").update({ updated_at: new Date().toISOString() }).eq("id", userId);
    await supabase.from("notifications").insert({
      user_id: userId,
      title: "Seu horário foi confirmado",
      body: `${service.name} com ${barber.name} — ${startsAt.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}. Código ${inserted.code}.`,
      kind: "agendamento",
    });

    return {
      ok: true as const,
      id: inserted.id,
      code: inserted.code,
      startsAt: startsAt.toISOString(),
      priceCents: service.price_cents,
    };
  });

export const cancelAppointment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: appt } = await supabase
      .from("appointments")
      .select("id,starts_at,status,customer_id")
      .eq("id", data.id)
      .single();

    if (!appt || appt.customer_id !== userId) {
      return { ok: false as const, message: "Agendamento não encontrado." };
    }
    if (appt.status === "cancelado") return { ok: true as const };
    if (appt.status === "concluido" || appt.status === "em_atendimento") {
      return { ok: false as const, message: "Este atendimento já aconteceu e não pode ser cancelado." };
    }

    const { data: settings } = await supabase.from("settings").select("min_hours_ahead").eq("id", 1).single();
    const minHours = settings?.min_hours_ahead ?? 2;
    const hoursAhead = (new Date(appt.starts_at).getTime() - Date.now()) / 3_600_000;
    if (hoursAhead < minHours) {
      return {
        ok: false as const,
        message: `Cancelamentos precisam ser feitos com ${minHours}h de antecedência. Fale com a barbearia.`,
      };
    }

    const { error } = await supabase
      .from("appointments")
      .update({ status: "cancelado", updated_at: new Date().toISOString() })
      .eq("id", data.id);
    if (error) return { ok: false as const, message: "Não conseguimos cancelar agora. Tente novamente." };

    await supabase.from("notifications").insert({
      user_id: userId,
      title: "Agendamento cancelado",
      body: "Seu horário foi cancelado com sucesso. Esperamos você em breve!",
      kind: "cancelamento",
    });

    return { ok: true as const };
  });


export const updateProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({
      fullName: z.string().trim().min(2).max(120),
      phone: z.string().trim().min(8).max(30),
      cpf: z.string().trim().max(14).optional(),
    }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: data.fullName,
        phone: data.phone,
        cpf: data.cpf || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      return { ok: false as const, message: "Não foi possível atualizar seu perfil." };
    }

    return { ok: true as const };
  });
