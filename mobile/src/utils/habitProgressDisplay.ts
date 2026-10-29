/**
 * Display helpers for measurable habit progress on the selected occurrence.
 * Clamps only visual fill — never the recorded value shown to the user.
 */

export type HabitProgressDisplay = {
  /** Recorded value for the selected occurrence (may exceed target). */
  recorded: number;
  /** Target when valid (> 0); otherwise null. */
  target: number | null;
  /** Unit label derived from target_type. */
  unit: string;
  /** Primary text, e.g. "3 / 5 times" or "2 (no target)". */
  valueLabel: string;
  /** 0–1 fill ratio; clamped; null when no valid target. */
  fillRatio: number | null;
  /** Whether recorded meets or exceeds a valid target. */
  goalMet: boolean;
};

export function resolveHabitProgressDisplay(input: {
  progress: number | null | undefined;
  targetValue: number | null | undefined;
  hasTarget?: boolean;
  targetType?: string | null;
}): HabitProgressDisplay {
  const recorded =
    typeof input.progress === 'number' && Number.isFinite(input.progress)
      ? Math.max(0, input.progress)
      : 0;

  const rawTarget = input.targetValue;
  const hasTarget = !!input.hasTarget;
  const target =
    hasTarget &&
    typeof rawTarget === 'number' &&
    Number.isFinite(rawTarget) &&
    rawTarget > 0
      ? rawTarget
      : null;

  const isTime = String(input.targetType || '').toUpperCase() === 'TIME';
  const unit = isTime ? (target === 1 ? 'minute' : 'minutes') : target === 1 ? 'time' : 'times';

  if (target == null) {
    return {
      recorded,
      target: null,
      unit: isTime ? 'minutes' : 'times',
      valueLabel: hasTarget ? `${recorded} (target unavailable)` : String(recorded),
      fillRatio: null,
      goalMet: false,
    };
  }

  const fillRatio = Math.min(1, recorded / target);
  const goalMet = recorded >= target;
  const valueLabel = `${recorded} / ${target} ${unit}`;

  return {
    recorded,
    target,
    unit,
    valueLabel,
    fillRatio,
    goalMet,
  };
}
