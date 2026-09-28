import { FormEvent, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Loader2, LockKeyhole, Mail } from "lucide-react";
import { toast } from "sonner";
import { PublicLayout, PageHeader } from "@/components/site/PublicLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Entrar — Barbearia Nobre" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(false);

  if (isAuthenticated) {
    void navigate({ to: "/agendamento", replace: true });
    return null;
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Login realizado.");
        await navigate({ to: "/dashboard" });
      } else {
        if (name.trim().length < 2) throw new Error("Informe seu nome.");
        if (phone.trim().length < 8) throw new Error("Informe um telefone válido.");
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name.trim(), phone: phone.trim() } },
        });
        if (error) throw error;
        if (!data.session) setCreated(true);
        else await navigate({ to: "/dashboard" });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível concluir.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PublicLayout>
      <PageHeader eyebrow="Conta" title={mode === "login" ? "Entre para agendar" : "Crie sua conta"} description="Acesse seus agendamentos e reserve seu próximo horário." />
      <div className="container-page pb-20">
        <div className="mx-auto max-w-md panel p-6 sm:p-8">
          {created ? (
            <div className="text-center">
              <CheckCircle2 className="mx-auto size-12 text-primary" />
              <h2 className="mt-5 text-2xl">Verifique seu e-mail</h2>
              <p className="mt-3 text-sm text-muted-foreground">Enviamos um link de confirmação para {email}.</p>
              <Button asChild className="mt-6" variant="outline"><Link to="/login">Voltar para login</Link></Button>
            </div>
          ) : (
            <>
              <div className="mb-6 grid grid-cols-2 rounded-lg border border-border p-1">
                <button type="button" className={`rounded-md px-3 py-2 text-sm ${mode === "login" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`} onClick={() => setMode("login")}>Entrar</button>
                <button type="button" className={`rounded-md px-3 py-2 text-sm ${mode === "signup" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`} onClick={() => setMode("signup")}>Criar conta</button>
              </div>
              <form onSubmit={submit} className="space-y-4">
                {mode === "signup" && <>
                  <label className="block text-sm font-medium">Nome<input value={name} onChange={(e) => setName(e.target.value)} className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3" required /></label>
                  <label className="block text-sm font-medium">Telefone<input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3" inputMode="tel" required /></label>
                </>}
                <label className="block text-sm font-medium"><span className="flex items-center gap-2"><Mail className="size-4" />E-mail</span><input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3" type="email" required /></label>
                <label className="block text-sm font-medium"><span className="flex items-center gap-2"><LockKeyhole className="size-4" />Senha</span><input value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3" type="password" minLength={6} required /></label>
                <Button type="submit" className="w-full" size="lg" disabled={loading}>{loading && <Loader2 className="mr-2 size-4 animate-spin" />}{mode === "login" ? "Entrar" : "Criar conta"}</Button>
              </form>
              <Button asChild variant="ghost" className="mt-4 w-full"><Link to="/"><ArrowLeft className="mr-2 size-4" />Voltar ao início</Link></Button>
            </>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
