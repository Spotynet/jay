/**
 * Run: npx --yes tsx src/utils/fetchGeneration.test.ts
 *
 * Models Today/Journal fetch-generation guards: an older in-flight response
 * must not overwrite a newer date/focus load.
 */
import assert from 'node:assert/strict';

function createFetchGate() {
  let gen = 0;
  return {
    begin() {
      gen += 1;
      return gen;
    },
    isCurrent(token: number) {
      return token === gen;
    },
  };
}

const gate = createFetchGate();
const first = gate.begin();
const second = gate.begin();
assert.equal(gate.isCurrent(first), false, 'first fetch stale after second begins');
assert.equal(gate.isCurrent(second), true);

// Simulate apply order: first resolves after second — must no-op
let applied = '';
if (gate.isCurrent(second)) applied = 'B';
if (gate.isCurrent(first)) applied = 'A';
assert.equal(applied, 'B');

console.log('fetchGeneration.test.ts: all assertions passed');
