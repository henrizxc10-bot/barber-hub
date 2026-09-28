import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Barber } from "@/lib/api";
import { initials } from "@/lib/format";

export function BarberCard({ barber }: { barber: Barber }) {
  return (
    <article className="panel flex flex-col items-center p-6 text-center transition-transform duration-300 hover:-translate-y-1">
      <div
        className="flex size-20 items-center justify-center rounded-full border border-primary/40 bg-accent font-display text-3xl text-primary"
        aria-hidden
      >
        {initials(barber.name)}
      </div>
      <h3 className="mt-4 text-2xl">{barber.name}</h3>
      <p className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground">
        <Star className="size-4 fill-primary text-primary" aria-hidden />
        {barber.rating.toFixed(1)} · {barber.reviews_count} avaliações
      </p>
      <p className="mt-3 text-sm text-muted-foreground">{barber.bio}</p>

      <ul className="mt-4 flex flex-wrap justify-center gap-2">
        {barber.specialties.map((s) => (
          <li key={s} className="rounded-full border border-border bg-accent px-2.5 py-1 text-xs text-foreground">
            {s}
          </li>
        ))}
      </ul>

      <div className="mt-5 flex w-full gap-2">
        <Button asChild variant="outline" className="flex-1">
          <Link to="/barbeiros/$slug" params={{ slug: barber.slug }}>
            Ver perfil
          </Link>
        </Button>
        <Button asChild className="flex-1">
          <Link to="/agendamento" search={{ barbeiro: barber.slug }}>
            Agendar
          </Link>
        </Button>
      </div>
    </article>
  );
}
