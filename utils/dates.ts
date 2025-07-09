export function getStrDateTime(date: Date) {
  return date.toISOString().split('T').join(' ').split('.')[0];
}

export function datePlusDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

export function toISOString(date: string) {
  return date.replace(' ', 'T') + 'Z';
}