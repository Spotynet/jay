/**
 * Run: npx --yes tsx src/components/timeline/dayMetricStripLayout.test.ts
 */
import assert from 'node:assert/strict';
import { ringsRequiredWidth, ringsShouldFit } from './DayMetricStrip';

{
  assert.equal(ringsRequiredWidth(0), 0);
  assert.equal(ringsRequiredWidth(1), 72);
  // 4 × 72 + 3 × 14 = 288 + 42 = 330
  assert.equal(ringsRequiredWidth(4), 330);
}

{
  // Comfortably wider than required → fit
  assert.equal(ringsShouldFit(360, 4, false), true);
  assert.equal(ringsShouldFit(360, 4, true), true);
}

{
  // Exactly at required while already fitting → stay in fit
  assert.equal(ringsShouldFit(330, 4, true), true);
  // Crossing below required → overflow
  assert.equal(ringsShouldFit(329, 4, true), false);
}

{
  // Entering fit requires hysteresis above required
  assert.equal(ringsShouldFit(330, 4, false), false);
  assert.equal(ringsShouldFit(330 + 8, 4, false), true);
}

{
  // Narrow / unknown width
  assert.equal(ringsShouldFit(0, 4, false), false);
  assert.equal(ringsShouldFit(200, 4, false), false);
}

console.log('dayMetricStripLayout.test.ts: all assertions passed');
