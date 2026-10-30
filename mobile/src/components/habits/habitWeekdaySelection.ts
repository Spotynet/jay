/**
 * Habit `days_of_week` uses 0=Monday … 6=Sunday.
 * API JSON may deliver numbers or numeric strings — normalize before UI checks.
 */
export function normalizeDaysOfWeek(raw: unknown): number[] {
  if (!Array.isArray(raw)) return [];
  const out: number[] = [];
  for (const item of raw) {
    const n = typeof item === 'number' ? item : Number(item);
    if (!Number.isFinite(n)) continue;
    const day = Math.trunc(n);
    if (day < 0 || day > 6) continue;
    if (!out.includes(day)) out.push(day);
  }
  return out.sort((a, b) => a - b);
}

export function isWeekdaySelected(selected: number[], dayIndex: number): boolean {
  return selected.includes(dayIndex);
}
