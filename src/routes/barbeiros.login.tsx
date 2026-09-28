import { FormEvent, useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2, LockKeyhole, UserRound } from "lucide-react";
import { toast } from "sonner";

import { PageHeader, PublicLayout } from "@/components/site/PublicLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { BARBER_EMAIL, getBarberPassword, isBarberUsername } from "@/lib/barberAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/barbeiros/login")({
  head: () => ({ meta: [{ title: "Acesso dos barbeiros — Barbearia Nobre" }] }),
  component: BarberLoginPage,
});

function BarberLoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) void navigate({ to: "/admin", replace: true });
  }, [isAuthenticated, navigate]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!isBarberUsername(username)) {
      toast.error("Usuário ou senha inválidos.");
      return;
    }

    const configuredPassword = getBarberPassword();
    if (!configuredPassword) {
      toast.error("A senha do acesso dos barbeiros ainda não foi configurada no ambiente.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: BARBER_EMAIL, password });
      if (error) throw error;
      toast.success("Acesso dos barbeiros liberado.");
      await navigate({ to: "/admin", replace: true });
    } catch {
      toast.error("Usuário ou senha inválidos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PublicLayout>
      <PageHeader eyebrow="Equipe" title="Acesso dos barbeiros" description="Entre para acessar o painel de gestão da barbearia." />
      <div className="container-page pb-20">
        <div className="mx-auto max-w-md panel p-6 sm:p-8">
          <form onSubmit={submit} className="space-y-4">
            <label className="block text-sm font-medium">
              <span className="flex items-center gap-2"><UserRound className="size-4" />Usuário</span>
              <input value={username} onChange={(event) => setUsername(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3" autoComplete="username" required />
            </label>
            <label className="block text-sm font-medium">
              <span className="flex items-center gap-2"><LockKeyhole className="size-4" />Senha</span>
              <input value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3" type="password" autoComplete="current-password" required />
            </label>
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
              Entrar no painel
            </Button>
          </form>
          <Button asChild variant="ghost" className="mt-4 w-full"><Link to="/"><ArrowLeft className="mr-2 size-4" />Voltar ao início</Link></Button>
        </div>
      </div>
    </PublicLayout>
  );
}
