export function formatDate(date: Date) {
  return date.toISOString().split('T')[0];
}

export function formatDateTime(date: Date) {
  return date.toISOString().split('T').join(' ');
}

export function datePlusDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}