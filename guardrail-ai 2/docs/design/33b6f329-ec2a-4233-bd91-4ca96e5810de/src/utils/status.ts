import { Ban, CheckCircle2, CircleDashed, Clock, LucideIcon, XCircle } from 'lucide-react';

export type StatusTone = 'positive' | 'negative' | 'neutral' | 'warning';

export interface StatusStyle {
  tone: StatusTone;
  icon: LucideIcon;
}

const styles: Record<string, StatusStyle> = {
  Completed: { tone: 'positive', icon: CheckCircle2 },
  Consumed: { tone: 'positive', icon: CheckCircle2 },
  Failed: { tone: 'negative', icon: XCircle },
  Rejected: { tone: 'negative', icon: Ban },
  Voided: { tone: 'neutral', icon: CircleDashed },
  Expired: { tone: 'neutral', icon: Clock },
  Pending: { tone: 'warning', icon: Clock }
};

export function statusStyle(status: string): StatusStyle {
  return styles[status] ?? { tone: 'neutral', icon: CircleDashed };
}