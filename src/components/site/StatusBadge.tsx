import { STATUS_LABEL } from "@/lib/booking";
import { cn } from "@/lib/utils";

const TONE: Record<string, string> = {
  aguardando: "bg-warning/15 text-warning border-warning/30",
  confirmado: "bg-success/15 text-success border-success/30",
  em_atendimento: "bg-primary/15 text-primary border-primary/30",
  concluido: "bg-muted text-muted-foreground border-border",
  cancelado: "bg-destructive/15 text-destructive border-destructive/30",
  nao_compareceu: "bg-destructive/10 text-destructive border-destructive/20",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide",
        TONE[status] ?? TONE["concluido"],
        className,
      )}
    >
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}
