import { useEffect, useMemo, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  History,
  Loader2,
  LogOut,
  Scissors,
  UserRound,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader, PublicLayout } from "@/components/site/PublicLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { myAppointmentsQuery, profileQuery } from "@/lib/api";
import { STATUS_LABEL, canCancel } from "@/lib/booking";
import { cancelAppointment, updateProfile } from "@/lib/appointments.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Minha conta — Barbearia Nobre" }] }),
  component: DashboardPage,
});

type Tab = "proximos" | "historico" | "perfil";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "full",
});

const timeFormatter = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
});

const moneyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}

function formatTime(value: string) {
  return timeFormatter.format(new Date(value));
}

function DashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const appointments = useQuery(myAppointmentsQuery(user?.id));
  const profile = useQuery(profileQuery(user?.id));
  const [tab, setTab] = useState<Tab>("proximos");
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [cpf, setCpf] = useState("");

  useEffect(() => {
    if (!profile.data) return;
    setName(profile.data.full_name ?? "");
    setPhone(profile.data.phone ?? "");
    setCpf(profile.data.cpf ?? "");
  }, [profile.data]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      void navigate({ to: "/login" });
    }
  }, [authLoading, isAuthenticated, navigate]);

  const rows = appointments.data ?? [];
  const now = Date.now();

  const upcoming = useMemo(
    () =>
      rows
        .filter(
          (appointment) =>
            new Date(appointment.starts_at).getTime() >= now &&
            appointment.status !== "cancelado",
        )
        .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()),
    [rows, now],
  );

  const history = useMemo(
    () =>
      rows
        .filter(
          (appointment) =>
            new Date(appointment.starts_at).getTime() < now ||
            ["concluido", "cancelado", "nao_compareceu"].includes(appointment.status),
        )
        .sort((a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime()),
    [rows, now],
  );

  async function handleCancel(id: string) {
    if (!window.confirm("Cancelar este agendamento?")) return;
    setCancellingId(id);
    try {
      const result = await cancelAppointment({ data: { id } });
      if (!result.ok) throw new Error(result.message);
      toast.success("Agendamento cancelado.");
      await queryClient.invalidateQueries({ queryKey: ["my-appointments", user?.id] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível cancelar.");
    } finally {
      setCancellingId(null);
    }
  }

  async function handleProfileSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingProfile(true);
    try {
      const result = await updateProfile({
        data: {
          fullName: name,
          phone,
          cpf: cpf || undefined,
        },
      });
      if (!result.ok) throw new Error(result.message);
      toast.success("Perfil atualizado.");
      await queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível salvar seu perfil.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    await navigate({ to: "/" });
  }

  if (authLoading || !isAuthenticated) {
    return (
      <PublicLayout>
        <div className="container-page py-20 text-center">
          <Loader2 className="mx-auto size-6 animate-spin text-primary" />
        </div>
      </PublicLayout>
    );
  }

  const displayName =
    profile.data?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Cliente";

  return (
    <PublicLayout>
      <PageHeader
        eyebrow="Minha conta"
        title={`Olá, ${displayName.split(" ")[0]}`}
        description="Acompanhe seus horários, consulte seu histórico e mantenha seus dados atualizados."
      />

      <div className="container-page pb-20">
        <div className="mb-6 flex flex-col gap-4 rounded-xl border border-border bg-surface p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full border border-border px-3 py-1">
                {upcoming.length} próximo{upcoming.length === 1 ? "" : "s"} agendamento{upcoming.length === 1 ? "" : "s"}
              </span>
              <span className="rounded-full border border-border px-3 py-1">
                {profile.data?.loyalty_points ?? 0} pontos
              </span>
            </div>
          </div>
          <Button variant="outline" onClick={signOut}>
            <LogOut className="mr-2 size-4" /> Sair
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          <nav className="h-fit rounded-xl border border-border bg-surface p-2">
            {([
              ["proximos", "Próximos", CalendarDays],
              ["historico", "Histórico", History],
              ["perfil", "Meu perfil", UserRound],
            ] as const).map(([value, label, Icon]) => (
              <button
                key={value}
                type="button"
                onClick={() => setTab(value)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium transition-colors ${
                  tab === value ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
              >
                <Icon className="size-4" />
                {label}
              </button>
            ))}
            <Button asChild className="mt-3 w-full">
              <Link to="/agendamento">
                <CalendarDays className="mr-2 size-4" /> Novo horário
              </Link>
            </Button>
          </nav>

          <section className="min-w-0">
            {tab === "perfil" ? (
              <form onSubmit={handleProfileSave} className="panel p-6 sm:p-8">
                <div className="mb-7">
                  <p className="eyebrow">Dados pessoais</p>
                  <h2 className="mt-2 text-2xl">Meu perfil</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Mantenha seus dados corretos para agilizar seus próximos agendamentos.
                  </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="text-sm font-medium">
                    Nome completo
                    <input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      minLength={2}
                      maxLength={120}
                      required
                      className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3"
                    />
                  </label>
                  <label className="text-sm font-medium">
                    Telefone
                    <input
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      minLength={8}
                      maxLength={30}
                      required
                      inputMode="tel"
                      className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3"
                    />
                  </label>
                  <label className="text-sm font-medium">
                    CPF <span className="font-normal text-muted-foreground">(opcional)</span>
                    <input
                      value={cpf}
                      onChange={(event) => setCpf(event.target.value)}
                      maxLength={14}
                      inputMode="numeric"
                      className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3"
                    />
                  </label>
                  <label className="text-sm font-medium">
                    E-mail
                    <input
                      value={user?.email ?? ""}
                      readOnly
                      className="mt-2 h-11 w-full rounded-md border border-input bg-muted px-3 text-muted-foreground"
                    />
                  </label>
                </div>

                <div className="mt-7 flex justify-end">
                  <Button type="submit" disabled={savingProfile}>
                    {savingProfile && <Loader2 className="mr-2 size-4 animate-spin" />}
                    Salvar alterações
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-5">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="eyebrow">{tab === "proximos" ? "Agenda" : "Atendimentos"}</p>
                    <h2 className="mt-2 text-2xl">
                      {tab === "proximos" ? "Próximos agendamentos" : "Histórico"}
                    </h2>
                  </div>
                  {appointments.isFetching && <Loader2 className="size-5 animate-spin text-primary" />}
                </div>

                {appointments.isLoading ? (
                  <div className="panel p-10 text-center text-sm text-muted-foreground">Carregando seus agendamentos...</div>
                ) : (tab === "proximos" ? upcoming : history).length === 0 ? (
                  <div className="panel p-10 text-center">
                    <CalendarDays className="mx-auto size-10 text-primary" />
                    <h3 className="mt-4 text-xl">
                      {tab === "proximos" ? "Nenhum horário marcado" : "Seu histórico está vazio"}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {tab === "proximos"
                        ? "Escolha um serviço e reserve seu próximo horário."
                        : "Seus atendimentos aparecerão aqui depois que forem realizados."}
                    </p>
                    {tab === "proximos" && (
                      <Button asChild className="mt-5">
                        <Link to="/agendamento">Agendar agora</Link>
                      </Button>
                    )}
                  </div>
                ) : (
                  (tab === "proximos" ? upcoming : history).map((appointment) => {
                    const canCancelAppointment = canCancel(appointment.starts_at, appointment.status);
                    const serviceName = appointment.services?.name ?? "Serviço";
                    const barberName = appointment.barbers?.name ?? "Barbeiro";
                    const statusLabel = STATUS_LABEL[appointment.status] ?? appointment.status;

                    return (
                      <article key={appointment.id} className="panel p-5 sm:p-6">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                                {statusLabel}
                              </span>
                              <span className="text-xs text-muted-foreground">Código {appointment.code}</span>
                            </div>
                            <h3 className="mt-3 text-xl">{serviceName}</h3>
                            <p className="mt-1 text-sm text-muted-foreground">com {barberName}</p>
                          </div>
                          <div className="sm:text-right">
                            <p className="text-lg font-semibold">{moneyFormatter.format(appointment.price_cents / 100)}</p>
                            <p className="text-xs text-muted-foreground">{appointment.services?.duration_minutes ?? 0} min</p>
                          </div>
                        </div>

                        <div className="mt-5 grid gap-3 border-t border-border pt-5 sm:grid-cols-2">
                          <div className="flex gap-3">
                            <CalendarDays className="mt-0.5 size-5 text-primary" />
                            <div>
                              <p className="text-xs text-muted-foreground">Data</p>
                              <p className="text-sm font-medium capitalize">{formatDate(appointment.starts_at)}</p>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <Clock3 className="mt-0.5 size-5 text-primary" />
                            <div>
                              <p className="text-xs text-muted-foreground">Horário</p>
                              <p className="text-sm font-medium">
                                {formatTime(appointment.starts_at)} — {formatTime(appointment.ends_at)}
                              </p>
                            </div>
                          </div>
                        </div>

                        {appointment.notes && (
                          <p className="mt-4 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                            Observação: {appointment.notes}
                          </p>
                        )}

                        {tab === "proximos" && (
                          <div className="mt-5 flex flex-wrap gap-3">
                            {canCancelAppointment ? (
                              <Button
                                variant="outline"
                                disabled={cancellingId === appointment.id}
                                onClick={() => void handleCancel(appointment.id)}
                              >
                                {cancellingId === appointment.id ? (
                                  <Loader2 className="mr-2 size-4 animate-spin" />
                                ) : (
                                  <XCircle className="mr-2 size-4" />
                                )}
                                Cancelar horário
                              </Button>
                            ) : (
                              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                                <CheckCircle2 className="size-4" />
                                Este horário já está dentro do período sem cancelamento.
                              </p>
                            )}
                          </div>
                        )}
                      </article>
                    );
                  })
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </PublicLayout>
  );
}
