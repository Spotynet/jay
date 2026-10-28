/**
 * Run: npx --yes tsx src/utils/agendaNavigation.test.ts
 */
import assert from 'node:assert/strict';
import { parseAgendaEntityId, resolveAgendaEditorTarget } from './agendaNavigation';
import { AgendaItem } from './timelineLayout';

function base(partial: Partial<AgendaItem>): AgendaItem {
  return {
    id: 'x-1',
    title: 'Item',
    type: 'task',
    timeRange: '',
    isActive: true,
    startTime: null,
    ...partial,
  };
}

assert.equal(parseAgendaEntityId('h-42'), '42');
assert.equal(parseAgendaEntityId('t-7'), '7');
assert.equal(parseAgendaEntityId('e-99'), '99');
assert.equal(parseAgendaEntityId('bad'), null);

{
  const target = resolveAgendaEditorTarget(base({ id: 'h-12', type: 'habit' }));
  assert.equal(target.kind, 'habit');
  if (target.kind === 'habit') assert.equal(target.entityId, '12');
}

{
  const target = resolveAgendaEditorTarget(base({ id: 't-3', type: 'task' }));
  assert.equal(target.kind, 'task');
}

{
  let opened = false;
  const target = resolveAgendaEditorTarget(
    base({
      id: 'journal',
      type: 'journal',
      onPress: () => {
        opened = true;
      },
    }),
  );
  assert.equal(target.kind, 'journal');
  if (target.kind === 'journal') target.open();
  assert.equal(opened, true);
}

{
  const target = resolveAgendaEditorTarget(base({ id: 'br-1', type: 'finance' }));
  assert.equal(target.kind, 'unsupported');
}

console.log('agendaNavigation.test.ts: all assertions passed');
