import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { BarberCard } from "@/components/site/BarberCard";
import { PageHeader, PublicLayout } from "@/components/site/PublicLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { barbersQuery } from "@/lib/api";

export const Route = createFileRoute("/barbeiros")({
  head: () => ({
    meta: [
      { title: "Nossos barbeiros — Barbearia Nobre" },
      {
        name: "description",
        content: "Conheça a equipe da Barbearia Nobre, especialidades, avaliações e agende com o seu preferido.",
      },
      { property: "og:title", content: "Nossos barbeiros — Barbearia Nobre" },
      { property: "og:description", content: "Especialidades, avaliações e agenda de cada barbeiro." },
    ],
  }),
  component: BarbeirosPage,
});

function BarbeirosPage() {
  const { data, isLoading, isError } = useQuery(barbersQuery);

  return (
    <PublicLayout>
      <PageHeader
        eyebrow="Equipe"
        title="Conheça seu barbeiro"
        description="Cada profissional tem especialidades próprias. Escolha por afinidade ou deixe com quem estiver disponível."
      />
      <div className="container-page pb-20">
        {isError && (
          <p className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
            Não conseguimos carregar a equipe agora. Atualize a página e tente novamente.
          </p>
        )}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading && Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-80 rounded-xl" />)}
          {data?.map((b) => <BarberCard key={b.id} barber={b} />)}
        </div>
      </div>
    </PublicLayout>
  );
}
