import { useQuery } from "@tanstack/react-query";
import { Link, useRouterState } from "@tanstack/react-router";
import { CalendarDays, LayoutDashboard, Menu, Scissors, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { settingsQuery } from "@/lib/api";
import { cn } from "@/lib/utils";

const LINKS = [
  { to: "/", label: "Início" },
  { to: "/servicos", label: "Serviços" },
  { to: "/barbeiros", label: "Barbeiros" },
  { to: "/contato", label: "Contato" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const { data: settings } = useQuery(settingsQuery);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/85 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2" aria-label="Página inicial">
          <Scissors className="size-5 text-primary" aria-hidden />
          <span className="font-display text-xl tracking-wider">{settings?.shop_name ?? "Barbearia Nobre"}</span>
        </Link>

        <nav aria-label="Navegação principal" className="hidden items-center gap-7 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={cn(
                "text-sm font-medium tracking-wide transition-colors hover:text-primary",
                pathname === l.to ? "text-primary" : "text-muted-foreground",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <Button asChild variant="outline" size="sm">
              <Link to="/dashboard">
                <LayoutDashboard className="size-4" aria-hidden /> Minha conta
              </Link>
            </Button>
          ) : (
            <Button asChild variant="ghost" size="sm">
              <Link to="/login">Entrar</Link>
            </Button>
          )}
          <Button asChild size="sm">
            <Link to="/agendamento">
              <CalendarDays className="size-4" aria-hidden /> Agendar agora
            </Link>
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          className="inline-flex size-10 items-center justify-center rounded-md border border-border text-foreground md:hidden"
        >
          {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-surface md:hidden">
          <nav aria-label="Navegação principal" className="container-page flex flex-col py-3">
            {LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="py-3 text-base font-medium text-foreground"
              >
                {l.label}
              </Link>
            ))}
            <Link
              to={isAuthenticated ? "/dashboard" : "/login"}
              onClick={() => setOpen(false)}
              className="py-3 text-base font-medium text-foreground"
            >
              {isAuthenticated ? "Minha conta" : "Entrar"}
            </Link>
            <Button asChild className="mt-3 mb-4 w-full">
              <Link to="/agendamento" onClick={() => setOpen(false)}>
                Agendar agora
              </Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
