import { Link } from "@tanstack/react-router";
import { Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Service } from "@/lib/api";
import { brl, duration } from "@/lib/format";

import corte from "@/assets/servico-corte.jpg";
import barba from "@/assets/servico-barba.jpg";
import hero from "@/assets/hero-barbearia.jpg";

function imageFor(service: Service): string {
  const c = service.category.toLowerCase();
  if (c.includes("barba")) return barba;
  if (c.includes("cabelo") || c.includes("combo")) return corte;
  return hero;
}

export function ServiceCard({ service }: { service: Service }) {
  return (
    <article className="panel group flex flex-col overflow-hidden transition-transform duration-300 hover:-translate-y-1">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={imageFor(service)}
          alt={service.name}
          loading="lazy"
          width={1024}
          height={768}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-background/80 px-2.5 py-1 text-xs font-semibold text-primary">
          {service.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-2xl">{service.name}</h3>
        <p className="mt-2 flex-1 text-sm text-muted-foreground">{service.description}</p>

        <div className="mt-4 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="size-4 text-primary" aria-hidden />
            {duration(service.duration_minutes)}
          </span>
          <span className="font-display text-2xl text-primary">{brl(service.price_cents)}</span>
        </div>

        <Button asChild className="mt-5 w-full">
          <Link to="/agendamento" search={{ servico: service.slug }}>
            Agendar
          </Link>
        </Button>
      </div>
    </article>
  );
}
