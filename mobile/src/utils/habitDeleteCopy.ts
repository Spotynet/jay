/** Message for full habit definition + completion-history deletion (CASCADE). */
export function habitDeleteAlertMessage(habitName: string): string {
  const label = habitName.trim() || 'this habit';
  return `Delete “${label}” and its completion history? This can’t be undone.`;
}
