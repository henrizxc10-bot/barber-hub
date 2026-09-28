import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { PageHeader, PublicLayout } from "@/components/site/PublicLayout";
import { ServiceCard } from "@/components/site/ServiceCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { servicesQuery } from "@/lib/api";

export const Route = createFileRoute("/servicos")({
  head: () => ({
    meta: [
      { title: "Serviços e preços — Barbearia Nobre" },
      {
        name: "description",
        content: "Corte masculino, barba, degradê, platinado e mais. Veja duração, preço e agende online.",
      },
      { property: "og:title", content: "Serviços e preços — Barbearia Nobre" },
      { property: "og:description", content: "Veja duração, preço e agende o seu serviço online." },
    ],
  }),
  component: ServicosPage,
});

function ServicosPage() {
  const { data, isLoading, isError } = useQuery(servicesQuery);
  const [category, setCategory] = useState<string>("Todos");

  const categories = ["Todos", ...Array.from(new Set((data ?? []).map((s) => s.category)))];
  const filtered = (data ?? []).filter((s) => category === "Todos" || s.category === category);

  return (
    <PublicLayout>
      <PageHeader
        eyebrow="Serviços"
        title="Tabela de serviços"
        description="Todos os valores e durações são atualizados pela barbearia. Escolha o serviço e siga direto para o agendamento."
      />

      <div className="container-page pb-20">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por categoria">
          {categories.map((c) => (
            <Button
              key={c}
              size="sm"
              variant={category === c ? "default" : "outline"}
              onClick={() => setCategory(c)}
              aria-pressed={category === c}
            >
              {c}
            </Button>
          ))}
        </div>

        {isError && (
          <p className="mt-10 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
            Não conseguimos carregar os serviços. Atualize a página e tente novamente.
          </p>
        )}

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading && Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-96 rounded-xl" />)}
          {filtered.map((s) => <ServiceCard key={s.id} service={s} />)}
        </div>

        {!isLoading && filtered.length === 0 && (
          <p className="mt-10 text-sm text-muted-foreground">Nenhum serviço nesta categoria.</p>
        )}
      </div>
    </PublicLayout>
  );
}
