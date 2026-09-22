/**
 * Converts a Date to a YYYY-MM-DD string using LOCAL time components.
 * Unlike `date.toISOString().split('T')[0]`, this does NOT shift the date
 * when the user is in a negative UTC offset.
 */
export function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parses a YYYY-MM-DD string as LOCAL midnight.
 * `new Date("2025-09-01")` parses as UTC midnight, which shifts the date
 * backward for negative UTC offsets. This function avoids that.
 */
export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}
