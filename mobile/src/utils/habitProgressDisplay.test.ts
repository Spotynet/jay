/**
 * Run: npx --yes tsx src/utils/habitProgressDisplay.test.ts
 */
import assert from 'node:assert/strict';
import { resolveHabitProgressDisplay } from './habitProgressDisplay';

{
  const below = resolveHabitProgressDisplay({
    progress: 2,
    targetValue: 5,
    hasTarget: true,
    targetType: 'COUNT',
  });
  assert.equal(below.recorded, 2);
  assert.equal(below.target, 5);
  assert.equal(below.unit, 'times');
  assert.equal(below.valueLabel, '2 / 5 times');
  assert.equal(below.fillRatio, 0.4);
  assert.equal(below.goalMet, false);
}

{
  const at = resolveHabitProgressDisplay({
    progress: 5,
    targetValue: 5,
    hasTarget: true,
    targetType: 'COUNT',
  });
  assert.equal(at.goalMet, true);
  assert.equal(at.fillRatio, 1);
}

{
  // Over target: show actual recorded; clamp fill only.
  const over = resolveHabitProgressDisplay({
    progress: 8,
    targetValue: 5,
    hasTarget: true,
    targetType: 'COUNT',
  });
  assert.equal(over.recorded, 8);
  assert.equal(over.valueLabel, '8 / 5 times');
  assert.equal(over.fillRatio, 1);
  assert.equal(over.goalMet, true);
}

{
  const time = resolveHabitProgressDisplay({
    progress: 1,
    targetValue: 1,
    hasTarget: true,
    targetType: 'TIME',
  });
  assert.equal(time.unit, 'minute');
  assert.equal(time.valueLabel, '1 / 1 minute');
}

{
  const zeroTarget = resolveHabitProgressDisplay({
    progress: 3,
    targetValue: 0,
    hasTarget: true,
    targetType: 'COUNT',
  });
  assert.equal(zeroTarget.target, null);
  assert.equal(zeroTarget.fillRatio, null);
  assert.equal(zeroTarget.goalMet, false);
  assert.ok(zeroTarget.valueLabel.includes('unavailable'));
}

{
  const missingTarget = resolveHabitProgressDisplay({
    progress: 2,
    targetValue: null,
    hasTarget: true,
    targetType: 'COUNT',
  });
  assert.equal(missingTarget.target, null);
  assert.equal(missingTarget.fillRatio, null);
}

{
  const noGoal = resolveHabitProgressDisplay({
    progress: 1,
    targetValue: 5,
    hasTarget: false,
    targetType: 'COUNT',
  });
  assert.equal(noGoal.target, null);
  assert.equal(noGoal.fillRatio, null);
}

console.log('habitProgressDisplay.test.ts: all assertions passed');
