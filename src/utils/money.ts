const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

export function formatMoney(amount: number): string {
  return amount < 0 ? `-${formatter.format(Math.abs(amount))}` : formatter.format(amount);
}
/** API money is a 2-dp decimal string; convert for display/proportions only — totals always come from the server. */
export function toAmount(value: string | null | undefined): number {
  if (value === null || value === undefined || value === '') return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

/** Formats an API money string, or a dash when the server has no value (e.g. no limit set). */
export function formatApiMoney(value: string | null | undefined): string {
  return value === null || value === undefined ? '—' : formatMoney(toAmount(value));
}

/** Number from a form field → API money string. */
export function toMoneyString(value: number): string {
  return (Math.round(value * 100) / 100).toFixed(2);
}
