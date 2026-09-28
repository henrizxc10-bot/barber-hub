import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CalendarDays, CheckCircle2, Clock3, Loader2, Scissors, UserRound } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, PublicLayout } from "@/components/site/PublicLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { availabilityQuery, profileQuery, servicesQuery, barbersQuery } from "@/lib/api";
import { createAppointment } from "@/lib/appointments.functions";
import { useQuery } from "@tanstack/react-query";
import { minutesToLabel } from "@/lib/booking";

export const Route = createFileRoute("/agendamento")({
  head: () => ({ meta: [{ title: "Agendar atendimento — Barbearia Nobre" }] }),
  component: BookingPage,
});

function dateKey(date = new Date()) {
  return date.toLocaleDateString("sv-SE");
}

function BookingPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const services = useQuery(servicesQuery);
  const barbers = useQuery(barbersQuery);
  const profile = useQuery(profileQuery(user?.id));
  const [serviceId, setServiceId] = useState("");
  const [barberId, setBarberId] = useState("");
  const [date, setDate] = useState(dateKey());
  const [selected, setSelected] = useState<{ minute: number; barberId: string; barberName: string } | null>(null);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState<{ code: string; startsAt: string } | null>(null);

  const availability = useQuery(availabilityQuery({ serviceId, barberId: barberId || null, dateKey: date }));
  const slots = useMemo(() => (availability.data ?? []).flatMap((b) => b.slots.filter((s) => s.available).map((s) => ({ ...s, barberId: b.barberId, barberName: b.barberName }))), [availability.data]);
  const service = services.data?.find((s) => s.id === serviceId);

  const max = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 60);
    return dateKey(d);
  }, []);

  async function confirm() {
    if (!user) {
      await navigate({ to: "/login" });
      return;
    }
    if (!service || !selected) return;
    setSubmitting(true);
    try {
      const result = await createAppointment({
        data: {
          serviceId,
          barberId: selected.barberId,
          startsAt: `${date}T${minutesToLabel(selected.minute)}:00-03:00`,
          customerName: profile.data?.full_name || user.user_metadata?.full_name || user.email || "Cliente",
          customerPhone: profile.data?.phone || user.user_metadata?.phone || "",
          notes: notes.trim() || undefined,
        },
      });
      if (!result.ok) throw new Error(result.message);
      setConfirmed({ code: result.code, startsAt: result.startsAt });
      toast.success("Agendamento confirmado.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível concluir o agendamento.");
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading) return <PublicLayout><div className="container-page py-20">Carregando...</div></PublicLayout>;

  if (confirmed) return (
    <PublicLayout>
      <div className="container-page py-20">
        <div className="mx-auto max-w-xl panel p-8 text-center">
          <CheckCircle2 className="mx-auto size-14 text-primary" />
          <p className="eyebrow mt-5">Agendamento confirmado</p>
          <h1 className="mt-2 text-4xl">Seu horário está reservado.</h1>
          <p className="mt-4 text-muted-foreground">Código: <strong className="text-foreground">{confirmed.code}</strong></p>
          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-border p-4"><Scissors className="size-5 text-primary" /><p className="mt-2 text-xs text-muted-foreground">Serviço</p><p>{service?.name}</p></div>
            <div className="rounded-lg border border-border p-4"><CalendarDays className="size-5 text-primary" /><p className="mt-2 text-xs text-muted-foreground">Data</p><p>{new Date(confirmed.startsAt).toLocaleDateString("pt-BR")}</p></div>
            <div className="rounded-lg border border-border p-4"><Clock3 className="size-5 text-primary" /><p className="mt-2 text-xs text-muted-foreground">Horário</p><p>{new Date(confirmed.startsAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</p></div>
          </div>
          <div className="mt-7 flex justify-center gap-3"><Button asChild><Link to="/">Início</Link></Button><Button asChild variant="outline"><Link to="/agendamento">Novo agendamento</Link></Button></div>
        </div>
      </div>
    </PublicLayout>
  );

  return (
    <PublicLayout>
      <PageHeader eyebrow="Agendamento" title="Reserve seu horário" description="Escolha o serviço, profissional, data e horário." />
      <div className="container-page pb-20">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <section className="panel p-5 sm:p-7">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium">Serviço<select value={serviceId} onChange={(e) => { setServiceId(e.target.value); setSelected(null); }} className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3"><option value="">Selecione</option>{services.data?.map((s) => <option key={s.id} value={s.id}>{s.name} — R$ {(s.price_cents / 100).toFixed(2).replace(".", ",")} · {s.duration_minutes} min</option>)}</select></label>
                <label className="text-sm font-medium">Barbeiro<select value={barberId} onChange={(e) => { setBarberId(e.target.value); setSelected(null); }} className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3"><option value="">Qualquer disponível</option>{barbers.data?.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select></label>
                <label className="text-sm font-medium sm:col-span-2">Data<input type="date" value={date} min={dateKey()} max={max} onChange={(e) => { setDate(e.target.value); setSelected(null); }} className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3" /></label>
              </div>
            </section>
            <section className="panel p-5 sm:p-7">
              <div className="flex items-center justify-between"><div><p className="eyebrow">Horários</p><h2 className="mt-1 text-2xl">Disponibilidade</h2></div>{availability.isFetching && <Loader2 className="size-5 animate-spin text-primary" />}</div>
              {!serviceId && <p className="mt-6 text-sm text-muted-foreground">Escolha um serviço para consultar os horários.</p>}
              {serviceId && !availability.isLoading && slots.length === 0 && <p className="mt-6 text-sm text-muted-foreground">Nenhum horário disponível nesta data.</p>}
              <div className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-5">{slots.map((slot) => <button key={`${slot.barberId}-${slot.minute}`} type="button" onClick={() => setSelected({ minute: slot.minute, barberId: slot.barberId, barberName: slot.barberName })} className={`rounded-md border px-3 py-3 text-sm font-medium ${selected?.minute === slot.minute && selected.barberId === slot.barberId ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary"}`}>{slot.label}{!barberId && <span className="mt-1 block truncate text-[10px] opacity-70">{slot.barberName}</span>}</button>)}</div>
            </section>
            <section className="panel p-5 sm:p-7"><label className="text-sm font-medium">Observações <span className="text-muted-foreground">(opcional)</span><textarea value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={500} rows={4} className="mt-2 w-full rounded-md border border-input bg-background px-3 py-3" /></label></section>
          </div>
          <aside className="h-fit panel p-5 lg:sticky lg:top-6"><p className="eyebrow">Resumo</p><div className="mt-4 space-y-4"><div className="flex gap-3"><Scissors className="size-5 text-primary" /><div><p className="text-xs text-muted-foreground">Serviço</p><p>{service?.name ?? "—"}</p></div></div><div className="flex gap-3"><UserRound className="size-5 text-primary" /><div><p className="text-xs text-muted-foreground">Barbeiro</p><p>{selected?.barberName ?? "—"}</p></div></div><div className="flex gap-3"><CalendarDays className="size-5 text-primary" /><div><p className="text-xs text-muted-foreground">Data</p><p>{new Date(`${date}T12:00:00`).toLocaleDateString("pt-BR")}</p></div></div><div className="flex gap-3"><Clock3 className="size-5 text-primary" /><div><p className="text-xs text-muted-foreground">Horário</p><p>{selected ? minutesToLabel(selected.minute) : "—"}</p></div></div><div className="border-t border-border pt-4 flex justify-between"><span>Total</span><strong>R$ {service ? (service.price_cents / 100).toFixed(2).replace(".", ",") : "0,00"}</strong></div><Button className="w-full" size="lg" disabled={!service || !selected || submitting} onClick={confirm}>{submitting && <Loader2 className="mr-2 size-4 animate-spin" />}{isAuthenticated ? "Confirmar agendamento" : "Entrar e confirmar"}</Button></div></aside>
        </div>
      </div>
    </PublicLayout>
  );
}
