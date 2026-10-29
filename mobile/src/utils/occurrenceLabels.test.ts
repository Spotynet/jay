/**
 * Run: npx --yes tsx src/utils/occurrenceLabels.test.ts
 */
import assert from 'node:assert/strict';
import { formatOccurrenceCardLabels } from './occurrenceLabels';

{
  const today = formatOccurrenceCardLabels('2026-10-29', '2026-10-29');
  assert.equal(today.primary, 'Today');
  assert.ok(today.secondary?.includes('October'));
  assert.ok(today.secondary?.includes('29'));
}

{
  const yesterday = formatOccurrenceCardLabels('2026-10-28', '2026-10-29');
  assert.equal(yesterday.primary, 'Yesterday');
  assert.ok(yesterday.secondary);
}

{
  const tomorrow = formatOccurrenceCardLabels('2026-10-30', '2026-10-29');
  assert.equal(tomorrow.primary, 'Tomorrow');
  assert.ok(tomorrow.secondary);
}

{
  const older = formatOccurrenceCardLabels('2026-10-22', '2026-10-29');
  assert.notEqual(older.primary, 'Today');
  assert.equal(older.secondary, null);
  assert.ok(older.primary.length > 0);
}

console.log('occurrenceLabels.test.ts: all assertions passed');
