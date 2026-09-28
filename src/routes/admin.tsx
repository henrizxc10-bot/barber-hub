import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, CheckCircle2, Clock3, Loader2, LogOut, Scissors, Users } from "lucide-react";
import { toast } from "sonner";

import { PageHeader, PublicLayout } from "@/components/site/PublicLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { barbersQuery, servicesQuery } from "@/lib/api";
import { STATUS_LABEL } from "@/lib/booking";
import { updateAppointmentStatus } from "@/lib/appointments.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Administração — Barbearia Nobre" }] }),
  component: AdminPage,
});

type AdminAppointment = {
  id: string;
  code: string;
  customer_name: string;
  customer_phone: string | null;
  starts_at: string;
  ends_at: string;
  price_cents: number;
  status: string;
  notes: string | null;
  barbers: { name: string } | null;
  services: { name: string; duration_minutes: number } | null;
};

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function AdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, loading } = useAuth();
  const [statusFilter, setStatusFilter] = useState("todos");
  const [updating, setUpdating] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
  const [loaded, setLoaded] = useState(false);
  const barbers = useQuery(barbersQuery);
  const services = useQuery(servicesQuery);

  const load = async () => {
    const { data, error } = await supabase
      .from("appointments")
      .select("id,code,customer_name,customer_phone,starts_at,ends_at,price_cents,status,notes,barbers(name),services(name,duration_minutes)")
      .order("starts_at", { ascending: true })
      .limit(200);
    if (error) {
      toast.error("Não foi possível carregar a agenda administrativa.");
      return;
    }
    setAppointments((data ?? []) as AdminAppointment[]);
    setLoaded(true);
  };

  useMemo(() => {
    if (!loading && !isAuthenticated) void navigate({ to: "/login" });
    if (isAuthenticated && !loaded) void load();
  }, [loading, isAuthenticated, loaded]);

  const filtered = statusFilter === "todos" ? appointments : appointments.filter((item) => item.status === statusFilter);
  const today = new Date().toDateString();
  const todayAppointments = appointments.filter((item) => new Date(item.starts_at).toDateString() === today && item.status !== "cancelado");
  const revenue = appointments.filter((item) => item.status === "concluido").reduce((sum, item) => sum + item.price_cents, 0);

  async function changeStatus(id: string, status: "aguardando" | "confirmado" | "em_atendimento" | "concluido" | "cancelado" | "nao_compareceu") {
    setUpdating(id);
    try {
      const result = await updateAppointmentStatus({ data: { id, status } });
      if (!result.ok) throw new Error(result.message);
      toast.success("Status atualizado.");
      await load();
      await queryClient.invalidateQueries();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível atualizar.");
    } finally {
      setUpdating(null);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    await navigate({ to: "/" });
  }

  if (loading || !isAuthenticated) {
    return <PublicLayout><div className="container-page py-20 text-center"><Loader2 className="mx-auto size-6 animate-spin text-primary" /></div></PublicLayout>;
  }

  return (
    <PublicLayout>
      <PageHeader eyebrow="Gestão" title="Painel administrativo" description="Acompanhe a operação da barbearia em um só lugar." />
      <div className="container-page pb-20 space-y-8">
        <div className="flex flex-wrap justify-end gap-3">
          <Button asChild variant="outline"><Link to="/dashboard">Minha conta</Link></Button>
          <Button variant="outline" onClick={signOut}><LogOut className="mr-2 size-4" />Sair</Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="panel p-5"><p className="text-sm text-muted-foreground">Hoje</p><p className="mt-2 text-3xl">{todayAppointments.length}</p><p className="text-xs text-muted-foreground">atendimentos</p></div>
          <div className="panel p-5"><p className="text-sm text-muted-foreground">Faturamento concluído</p><p className="mt-2 text-2xl">{money.format(revenue / 100)}</p></div>
          <div className="panel p-5"><p className="text-sm text-muted-foreground">Barbeiros ativos</p><p className="mt-2 text-3xl">{barbers.data?.length ?? 0}</p></div>
          <div className="panel p-5"><p className="text-sm text-muted-foreground">Serviços ativos</p><p className="mt-2 text-3xl">{services.data?.length ?? 0}</p></div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <section className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div><p className="eyebrow">Agenda</p><h2 className="mt-2 text-2xl">Atendimentos</h2></div>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option value="todos">Todos os status</option>
                {Object.entries(STATUS_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>

            {!loaded ? <div className="panel p-10 text-center"><Loader2 className="mx-auto size-6 animate-spin" /></div> :
              filtered.length === 0 ? <div className="panel p-10 text-center text-sm text-muted-foreground">Nenhum atendimento encontrado.</div> :
              filtered.map((item) => (
                <article key={item.id} className="panel p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs text-primary">{STATUS_LABEL[item.status] ?? item.status}</span>
                        <span className="text-xs text-muted-foreground">#{item.code}</span>
                      </div>
                      <h3 className="mt-2 text-lg">{item.customer_name}</h3>
                      <p className="text-sm text-muted-foreground">{item.services?.name ?? "Serviço"} · {item.barbers?.name ?? "Barbeiro"}</p>
                    </div>
                    <p className="font-semibold">{money.format(item.price_cents / 100)}</p>
                  </div>
                  <div className="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-2">
                    <div className="flex gap-2 text-sm"><CalendarDays className="size-4 text-primary" />{new Date(item.starts_at).toLocaleDateString("pt-BR")} <Clock3 className="ml-2 size-4 text-primary" />{new Date(item.starts_at).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}</div>
                    <div className="flex gap-2 text-sm text-muted-foreground"><Users className="size-4" />{item.customer_phone ?? "Sem telefone"}</div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(["aguardando","confirmado","em_atendimento","concluido","nao_compareceu","cancelado"] as const).map((status) => (
                      <Button key={status} size="sm" variant={item.status === status ? "default" : "outline"} disabled={updating === item.id || item.status === status} onClick={() => void changeStatus(item.id,status)}>
                        {updating === item.id && item.status !== status ? <Loader2 className="mr-1 size-3 animate-spin" /> : null}
                        {STATUS_LABEL[status]}
                      </Button>
                    ))}
                  </div>
                </article>
              ))}
          </section>

          <aside className="space-y-4">
            <div className="panel p-5">
              <div className="flex items-center gap-2"><Scissors className="size-5 text-primary" /><h3 className="text-lg">Barbeiros</h3></div>
              <div className="mt-4 space-y-3">
                {(barbers.data ?? []).map((barber) => <div key={barber.id} className="flex items-start justify-between gap-3"><div><p className="text-sm font-medium">{barber.name}</p><p className="text-xs text-muted-foreground">{barber.specialties.join(" · ")}</p></div><span className="text-xs">★ {barber.rating.toFixed(1)}</span></div>)}
              </div>
            </div>
            <div className="panel p-5">
              <div className="flex items-center gap-2"><CheckCircle2 className="size-5 text-primary" /><h3 className="text-lg">Serviços</h3></div>
              <div className="mt-4 space-y-2">
                {(services.data ?? []).slice(0,8).map((service) => <div key={service.id} className="flex justify-between gap-3 text-sm"><span>{service.name}</span><span>{money.format(service.price_cents/100)}</span></div>)}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </PublicLayout>
  );
}
