import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { buildSlots, timeStringToMinutes, type Interval, type Slot } from "@/lib/booking";
import { toDateKey } from "@/lib/format";

export type Service = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price_cents: number;
  duration_minutes: number;
  category: string;
  active: boolean;
};

export type Barber = {
  id: string;
  name: string;
  slug: string;
  bio: string;
  specialties: string[];
  rating: number;
  reviews_count: number;
  active: boolean;
};

export type Settings = {
  shop_name: string;
  address: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  slot_interval_minutes: number;
  buffer_minutes: number;
  min_hours_ahead: number;
  max_days_ahead: number;
  cancellation_policy: string;
};

function unwrap<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
}

export const servicesQuery = queryOptions({
  queryKey: ["services"],
  queryFn: async (): Promise<Service[]> =>
    unwrap(
      await supabase
        .from("services")
        .select("id,name,slug,description,price_cents,duration_minutes,category,active")
        .eq("active", true)
        .order("price_cents", { ascending: true }),
    ) as Service[],
});

export const barbersQuery = queryOptions({
  queryKey: ["barbers"],
  queryFn: async (): Promise<Barber[]> =>
    unwrap(
      await supabase
        .from("barbers")
        .select("id,name,slug,bio,specialties,rating,reviews_count,active")
        .eq("active", true)
        .order("name"),
    ) as Barber[],
});

export const settingsQuery = queryOptions({
  queryKey: ["settings"],
  queryFn: async (): Promise<Settings> =>
    unwrap(
      await supabase
        .from("settings")
        .select(
          "shop_name,address,phone,whatsapp,instagram,slot_interval_minutes,buffer_minutes,min_hours_ahead,max_days_ahead,cancellation_policy",
        )
        .eq("id", 1)
        .single(),
    ) as Settings,
});

export const businessHoursQuery = queryOptions({
  queryKey: ["business-hours"],
  queryFn: async () =>
    unwrap(
      await supabase
        .from("business_hours")
        .select("weekday,is_open,opens_at,closes_at,break_start,break_end")
        .order("weekday"),
    ),
});

export function reviewsQuery(barberId: string) {
  return queryOptions({
    queryKey: ["reviews", barberId],
    queryFn: async () =>
      unwrap(
        await supabase
          .from("reviews")
          .select("id,customer_name,rating,comment,created_at")
          .eq("barber_id", barberId)
          .eq("approved", true)
          .order("created_at", { ascending: false })
          .limit(10),
      ),
  });
}

export type AvailabilityInput = {
  serviceId: string;
  barberId: string | null;
  dateKey: string;
};

export type BarberAvailability = { barberId: string; barberName: string; slots: Slot[] };

/**
 * Disponibilidade calculada dinamicamente: expediente da barbearia,
 * escala do barbeiro, bloqueios, agendamentos existentes, duração do
 * serviço, intervalo entre atendimentos e antecedência mínima.
 */
export function availabilityQuery(input: AvailabilityInput) {
  return queryOptions({
    queryKey: ["availability", input.serviceId, input.barberId, input.dateKey],
    enabled: Boolean(input.serviceId && input.dateKey),
    queryFn: async (): Promise<BarberAvailability[]> => {
      const date = new Date(`${input.dateKey}T00:00:00`);
      const weekday = date.getDay();

      const [serviceRes, settingsRes, hoursRes, barbersRes, schedulesRes] = await Promise.all([
        supabase
          .from("services")
          .select("duration_minutes")
          .eq("id", input.serviceId)
          .single(),
        supabase
          .from("settings")
          .select("slot_interval_minutes,buffer_minutes,min_hours_ahead")
          .eq("id", 1)
          .single(),
        supabase
          .from("business_hours")
          .select("is_open,opens_at,closes_at,break_start,break_end")
          .eq("weekday", weekday)
          .maybeSingle(),
        supabase.from("barbers").select("id,name").eq("active", true).order("name"),
        supabase.from("barber_schedules").select("barber_id,works,starts_at,ends_at").eq("weekday", weekday),
      ]);

      const service = unwrap(serviceRes) as { duration_minutes: number };
      const settings = unwrap(settingsRes) as {
        slot_interval_minutes: number;
        buffer_minutes: number;
        min_hours_ahead: number;
      };
      const hours = hoursRes.data as
        | {
            is_open: boolean;
            opens_at: string;
            closes_at: string;
            break_start: string | null;
            break_end: string | null;
          }
        | null;

      let barbers = (unwrap(barbersRes) as { id: string; name: string }[]) ?? [];
      if (input.barberId) barbers = barbers.filter((b) => b.id === input.barberId);
      if (!hours || !hours.is_open) return barbers.map((b) => ({ barberId: b.id, barberName: b.name, slots: [] }));

      const schedules = (unwrap(schedulesRes) as
        | { barber_id: string; works: boolean; starts_at: string; ends_at: string }[]
        | null) ?? [];

      const dayStart = new Date(date);
      const dayEnd = new Date(date);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const [apptRes, blockRes] = await Promise.all([
        supabase
          .from("appointments")
          .select("barber_id,starts_at,ends_at,status")
          .gte("starts_at", dayStart.toISOString())
          .lt("starts_at", dayEnd.toISOString())
          .in("status", ["aguardando", "confirmado", "em_atendimento"]),
        supabase
          .from("blocked_times")
          .select("barber_id,starts_at,ends_at")
          .lt("starts_at", dayEnd.toISOString())
          .gt("ends_at", dayStart.toISOString()),
      ]);

      const appts = (unwrap(apptRes) as { barber_id: string; starts_at: string; ends_at: string }[]) ?? [];
      const blocks = (unwrap(blockRes) as { barber_id: string | null; starts_at: string; ends_at: string }[]) ?? [];

      const toMinutes = (iso: string) => {
        const d = new Date(iso);
        if (d < dayStart) return 0;
        return d.getHours() * 60 + d.getMinutes();
      };

      const isToday = toDateKey(new Date()) === input.dateKey;
      const now = new Date();
      const minutesNowIfToday = isToday ? now.getHours() * 60 + now.getMinutes() : null;

      return barbers.map((barber) => {
        const schedule = schedules.find((s) => s.barber_id === barber.id);
        if (schedule && !schedule.works) {
          return { barberId: barber.id, barberName: barber.name, slots: [] };
        }

        const openMinute = Math.max(
          timeStringToMinutes(hours.opens_at),
          schedule ? timeStringToMinutes(schedule.starts_at) : 0,
        );
        const closeMinute = Math.min(
          timeStringToMinutes(hours.closes_at),
          schedule ? timeStringToMinutes(schedule.ends_at) : 24 * 60,
        );

        const busy: Interval[] = [];
        if (hours.break_start && hours.break_end) {
          busy.push({
            start: timeStringToMinutes(hours.break_start),
            end: timeStringToMinutes(hours.break_end),
          });
        }
        for (const a of appts) {
          if (a.barber_id === barber.id) busy.push({ start: toMinutes(a.starts_at), end: toMinutes(a.ends_at) });
        }
        for (const b of blocks) {
          if (!b.barber_id || b.barber_id === barber.id) {
            busy.push({ start: toMinutes(b.starts_at), end: toMinutes(b.ends_at) });
          }
        }

        return {
          barberId: barber.id,
          barberName: barber.name,
          slots: buildSlots({
            openMinute,
            closeMinute,
            busy,
            durationMinutes: service.duration_minutes,
            intervalMinutes: settings.slot_interval_minutes,
            bufferMinutes: settings.buffer_minutes,
            minLeadMinutes: settings.min_hours_ahead * 60,
            minutesNowIfToday,
          }),
        };
      });
    },
  });
}

export type AppointmentRow = {
  id: string;
  code: string;
  starts_at: string;
  ends_at: string;
  price_cents: number;
  status: string;
  notes: string | null;
  barbers: { name: string; slug: string } | null;
  services: { name: string; duration_minutes: number } | null;
};

export function myAppointmentsQuery(userId: string | undefined) {
  return queryOptions({
    queryKey: ["my-appointments", userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<AppointmentRow[]> =>
      unwrap(
        await supabase
          .from("appointments")
          .select(
            "id,code,starts_at,ends_at,price_cents,status,notes,barbers(name,slug),services(name,duration_minutes)",
          )
          .eq("customer_id", userId!)
          .order("starts_at", { ascending: false }),
      ) as AppointmentRow[],
  });
}

export function profileQuery(userId: string | undefined) {
  return queryOptions({
    queryKey: ["profile", userId],
    enabled: Boolean(userId),
    queryFn: async () =>
      unwrap(
        await supabase
          .from("profiles")
          .select("id,full_name,phone,cpf,loyalty_points")
          .eq("id", userId!)
          .single(),
      ),
  });
}

export function notificationsQuery(userId: string | undefined) {
  return queryOptions({
    queryKey: ["notifications", userId],
    enabled: Boolean(userId),
    queryFn: async () =>
      unwrap(
        await supabase
          .from("notifications")
          .select("id,title,body,kind,read,created_at")
          .eq("user_id", userId!)
          .order("created_at", { ascending: false })
          .limit(50),
      ),
  });
}
