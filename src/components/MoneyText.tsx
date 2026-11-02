import React from 'react';
import { cn } from '../utils/cn';
import { formatMoney } from '../utils/money';

interface MoneyTextProps {
  amount: number;
  className?: string;
}

export function MoneyText({ amount, className }: MoneyTextProps) {
  return <span className={cn('tabular font-semibold', amount < 0 && 'text-blocked-fg', className)}>{formatMoney(amount)}</span>;
}