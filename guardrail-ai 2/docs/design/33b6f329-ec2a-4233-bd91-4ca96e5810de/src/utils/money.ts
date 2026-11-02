const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

export function formatMoney(amount: number): string {
  return amount < 0 ? `-${formatter.format(Math.abs(amount))}` : formatter.format(amount);
}