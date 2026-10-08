const numberFormatter = new Intl.NumberFormat('es-GT');
const percentFormatter = new Intl.NumberFormat('es-GT', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCount(value: number): string {
  return numberFormatter.format(value);
}

export function formatPercentage(value: string): string {
  const amount = Number(value);
  return Number.isNaN(amount) ? value : `${percentFormatter.format(amount)} %`;
}