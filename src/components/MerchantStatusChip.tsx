import React from 'react';
import { Ban, CheckCircle2, CircleDashed } from 'lucide-react';
import { StatusChip } from './StatusChip';
import type { MerchantStatus } from '../types/merchant';

const config = {
  APPROVED: { label: 'APPROVED', tone: 'positive' as const, icon: CheckCircle2 },
  BLOCKED: { label: 'BLOCKED', tone: 'negative' as const, icon: Ban },
  NEW: { label: 'NEW', tone: 'neutral' as const, icon: CircleDashed }
};

export function MerchantStatusChip({ status }: {status: MerchantStatus;}) {
  const c = config[status];
  return <StatusChip label={c.label} tone={c.tone} icon={c.icon} className="text-[11px] font-semibold tracking-wide" />;
}