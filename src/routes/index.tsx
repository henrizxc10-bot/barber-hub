import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarCheck, Clock, MapPin, ShieldCheck, Sparkles, Star } from "lucide-react";

import { PublicLayout } from "@/components/site/PublicLayout";
import { ServiceCard } from "@/components/site/ServiceCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { barbersQuery, servicesQuery, settingsQuery } from "@/lib/api";

import hero from "@/assets/hero-barbearia.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Barbearia Nobre — Seu estilo. Seu horário. Seu lugar." },
      {
        name: "description",
        content:
          "Agende seu atendimento, escolha seu barbeiro e garanta seu horário na Barbearia Nobre em poucos cliques.",
      },
      { property: "og:title", content: "Barbearia Nobre — Seu estilo. Seu horário. Seu lugar." },
      {
        property: "og:description",
        content: "Corte, barba e tratamentos com agendamento online e horários em tempo real.",
      },
    ],
  }),
  component: Home,
});

const STEPS = [
  { icon: Sparkles, title: "Escolha o serviço", text: "Corte, barba, combo ou tratamento." },
  { icon: Star, title: "Escolha o barbeiro", text: "Ou deixe com quem estiver disponível." },
  { icon: Clock, title: "Escolha o horário", text: "Só aparecem horários realmente livres." },
  { icon: CalendarCheck, title: "Pronto", text: "Confirmação na hora com código do agendamento." },
];

function Home() {
  const barbers = useQuery(barbersQuery);
  const services = useQuery(servicesQuery);
  const settings = useQuery(settingsQuery);

  return (
    <PublicLayout>
      <section className="relative overflow-hidden">
        <img
          src={hero}
          alt="Interior da barbearia com cadeira de barbeiro clássica"
          width={1920}
          height={1200}
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-background/80" />
        <div className="container-page relative py-24 sm:py-32">
          <p className="eyebrow">{settings.data?.shop_name ?? "Barbearia Nobre"}</p>
          <h1 className="mt-4 max-w-2xl text-5xl sm:text-7xl">Seu estilo. Seu horário. Seu lugar.</h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Agende seu atendimento, escolha seu barbeiro e compre seus produtos favoritos em poucos cliques.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/agendamento">AGENDAR AGORA</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/servicos">Ver serviços</Link>
            </Button>
          </div>
          <dl className="mt-14 grid max-w-2xl grid-cols-2 gap-6 sm:grid-cols-3">
            <div>
              <dt className="text-xs uppercase tracking-widest text-muted-foreground">Barbeiros</dt>
              <dd className="font-display text-3xl text-primary">{barbers.data?.length ?? 5}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-muted-foreground">Serviços</dt>
              <dd className="font-display text-3xl text-primary">{services.data?.length ?? 10}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-muted-foreground">Avaliação</dt>
              <dd className="font-display text-3xl text-primary">4,8</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="container-page py-20">
        <p className="eyebrow">Como funciona</p>
        <h2 className="mt-3 text-4xl">Quatro passos, menos de um minuto</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <div key={s.title} className="panel p-6">
              <s.icon className="size-6 text-primary" aria-hidden />
              <p className="mt-4 text-xs tracking-widest text-muted-foreground">PASSO {i + 1}</p>
              <h3 className="mt-1 text-2xl">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-surface py-20">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Serviços</p>
              <h2 className="mt-3 text-4xl">Cuidado do corte ao acabamento</h2>
            </div>
            <Button asChild variant="outline">
              <Link to="/servicos">Ver todos</Link>
            </Button>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.isLoading &&
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-96 rounded-xl" />)}
            {services.isError && (
              <p className="text-sm text-destructive">
                Não conseguimos carregar os serviços agora. Atualize a página e tente novamente.
              </p>
            )}
            {services.data?.slice(0, 6).map((s) => <ServiceCard key={s.id} service={s} />)}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-surface py-20">
        <div className="container-page grid gap-10 md:grid-cols-2">
          <div>
            <p className="eyebrow">A casa</p>
            <h2 className="mt-3 text-4xl">Tradição com acabamento moderno</h2>
            <p className="mt-5 text-muted-foreground">
              Ambiente reservado, atendimento com hora marcada e profissionais especializados. Sem fila, sem
              espera — o seu horário é seu.
            </p>
            <ul className="mt-7 space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-5 text-primary" aria-hidden />
                <span>{settings.data?.address ?? "Endereço da barbearia"}</span>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="mt-0.5 size-5 text-primary" aria-hidden />
                <span>Terça a sábado — consulte os horários livres direto no agendamento.</span>
              </li>
              <li className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 size-5 text-primary" aria-hidden />
                <span>{settings.data?.cancellation_policy}</span>
              </li>
            </ul>
            <Button asChild className="mt-9" size="lg">
              <Link to="/agendamento">Agendar agora</Link>
            </Button>
          </div>
          <div className="panel overflow-hidden">
            <img
              src={hero}
              alt="Cadeira de barbeiro em ambiente escuro com detalhes dourados"
              loading="lazy"
              width={1920}
              height={1200}
              className="size-full object-cover"
            />
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
