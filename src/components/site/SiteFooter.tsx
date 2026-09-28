import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Instagram, MapPin, Phone } from "lucide-react";

import { settingsQuery } from "@/lib/api";

export function SiteFooter() {
  const { data: settings } = useQuery(settingsQuery);

  return (
    <footer className="mt-24 border-t border-border bg-surface">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div>
          <p className="font-display text-2xl text-primary">{settings?.shop_name ?? "Barbearia Nobre"}</p>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Corte, barba e cuidado com hora marcada. Tradição com acabamento moderno.
          </p>
        </div>

        <nav aria-label="Navegação do rodapé" className="text-sm">
          <p className="eyebrow mb-3">Navegar</p>
          <ul className="space-y-2 text-muted-foreground">
            <li>
              <Link to="/servicos" className="transition-colors hover:text-primary">
                Serviços
              </Link>
            </li>
            <li>
              <Link to="/barbeiros" className="transition-colors hover:text-primary">
                Barbeiros
              </Link>
            </li>
            <li>
              <Link to="/agendamento" className="transition-colors hover:text-primary">
                Agendar
              </Link>
            </li>
            <li>
              <Link to="/contato" className="transition-colors hover:text-primary">
                Contato
              </Link>
            </li>
          </ul>
        </nav>

        <div className="text-sm">
          <p className="eyebrow mb-3">Contato</p>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 text-primary" aria-hidden />
              <span>{settings?.address}</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="size-4 text-primary" aria-hidden />
              <span>{settings?.phone}</span>
            </li>
            <li className="flex items-center gap-2">
              <Instagram className="size-4 text-primary" aria-hidden />
              <span>{settings?.instagram}</span>
            </li>
          </ul>
        </div>

        <div className="text-sm">
          <p className="eyebrow mb-3">Legal</p>
          <ul className="space-y-2 text-muted-foreground">
            <li>
              <Link to="/politica-privacidade" className="transition-colors hover:text-primary">
                Política de privacidade
              </Link>
            </li>
            <li>
              <Link to="/termos" className="transition-colors hover:text-primary">
                Termos de uso
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        Conteúdo de demonstração — serviços, barbeiros e agendamentos são fictícios.
      </div>
    </footer>
  );
}
