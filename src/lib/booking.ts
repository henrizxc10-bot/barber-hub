/**
 * Regras de negócio do agendamento — puras e compartilhadas entre
 * cliente (exibição dos horários) e servidor (validação da reserva).
 */

export type Interval = { start: number; end: number }; // minutos a partir da meia-noite

export type SlotRule = {
  /** minuto de abertura do expediente no dia */
  openMinute: number;
  /** minuto de fechamento do expediente no dia */
  closeMinute: number;
  /** intervalos indisponíveis (agendamentos, bloqueios, pausas) */
  busy: Interval[];
  /** duração do serviço em minutos */
  durationMinutes: number;
  /** de quanto em quanto tempo os horários são ofertados */
  intervalMinutes: number;
  /** folga obrigatória entre atendimentos */
  bufferMinutes: number;
  /** limite mínimo de antecedência, em minutos a partir de agora */
  minLeadMinutes: number;
  /** minutos já decorridos hoje; use null quando a data não é hoje */
  minutesNowIfToday: number | null;
};

export type Slot = { minute: number; label: string; available: boolean };

export function minutesToLabel(minute: number): string {
  const h = Math.floor(minute / 60);
  const m = minute % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function timeStringToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

export function overlaps(a: Interval, b: Interval): boolean {
  return a.start < b.end && b.start < a.end;
}

export function buildSlots(rule: SlotRule): Slot[] {
  const slots: Slot[] = [];
  const {
    openMinute,
    closeMinute,
    busy,
    durationMinutes,
    intervalMinutes,
    bufferMinutes,
    minLeadMinutes,
    minutesNowIfToday,
  } = rule;

  if (closeMinute <= openMinute || durationMinutes <= 0) return slots;

  for (let start = openMinute; start + durationMinutes <= closeMinute; start += intervalMinutes) {
    const candidate: Interval = {
      start: start - bufferMinutes,
      end: start + durationMinutes + bufferMinutes,
    };
    let available = !busy.some((b) => overlaps(candidate, b));

    if (available && minutesNowIfToday !== null) {
      available = start >= minutesNowIfToday + minLeadMinutes;
    }

    slots.push({ minute: start, label: minutesToLabel(start), available });
  }

  return slots;
}

export const STATUS_LABEL: Record<string, string> = {
  aguardando: "Aguardando",
  confirmado: "Confirmado",
  em_atendimento: "Em atendimento",
  concluido: "Concluído",
  cancelado: "Cancelado",
  nao_compareceu: "Não compareceu",
};

export function canCancel(startsAt: string, status: string, minHoursAhead = 2): boolean {
  if (status !== "confirmado" && status !== "aguardando") return false;
  const diffHours = (new Date(startsAt).getTime() - Date.now()) / 3_600_000;
  return diffHours >= minHoursAhead;
}
