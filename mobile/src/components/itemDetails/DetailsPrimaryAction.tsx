import React, { useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { IconCheck, IconMinus, IconPlus } from 'tabler-icons-react-native';
import { useTheme } from '../../context/ThemeContext';
import { AppText } from '../ui/AppText';
import { Icon } from '../ui/Icon';
import { resolveHabitProgressDisplay } from '../../utils/habitProgressDisplay';
import { formatOccurrenceCardLabels } from '../../utils/occurrenceLabels';
import { toLocalDateString } from '../../utils/date';

type DetailsPrimaryActionProps = {
  /** Selected occurrence YYYY-MM-DD (never silently replaced with today). */
  occurrenceDate: string;
  /** Formatted clock for the occurrence, or null/empty when untimed. */
  occurrenceTime?: string | null;
  /**
   * When untimed, show this on the right (e.g. “Anytime” for habits).
   * Pass null to omit the time slot entirely (tasks without due time).
   */
  untimedLabel?: string | null;
  accent: string;
  completed: boolean;
  completing?: boolean;
  onToggleComplete: () => void;
  actionError?: string | null;
  /**
   * When false, omit the in-card binary Mark complete / Undo UI
   * (Habit binary completion lives on the identity row checkbox).
   * Default true for Task details.
   */
  showBinaryAction?: boolean;
  measurable?: {
    progress: number;
    target: number;
    hasTarget?: boolean;
    targetType?: string | null;
    busy?: boolean;
    onIncrement: () => void;
    onDecrement: () => void;
  } | null;
  goalLabel?: string | null;
};

/**
 * Selected-day card: date/time, plus measurable progress or (optionally) binary action.
 */
export function DetailsPrimaryAction({
  occurrenceDate,
  occurrenceTime,
  untimedLabel = null,
  accent,
  completed,
  completing,
  onToggleComplete,
  actionError,
  showBinaryAction = true,
  measurable,
  goalLabel,
}: DetailsPrimaryActionProps) {
  const { colors } = useTheme();
  const todayDate = toLocalDateString(new Date());
  const labels = useMemo(
    () => formatOccurrenceCardLabels(occurrenceDate, todayDate),
    [occurrenceDate, todayDate],
  );

  const timeText = occurrenceTime?.trim()
    ? occurrenceTime
    : untimedLabel != null
      ? untimedLabel
      : null;

  const progressDisplay = useMemo(() => {
    if (!measurable) return null;
    return resolveHabitProgressDisplay({
      progress: measurable.progress,
      targetValue: measurable.target,
      hasTarget: measurable.hasTarget !== false,
      targetType: measurable.targetType,
    });
  }, [measurable]);

  const showMeasurable = !!(measurable && progressDisplay);
  const showBinary = !showMeasurable && showBinaryAction;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={styles.topRow}>
        <AppText
          style={[styles.primaryDate, { color: colors.text }]}
          numberOfLines={2}
        >
          {labels.primary}
        </AppText>
        {timeText ? (
          <AppText style={[styles.time, { color: colors.subtext }]}>{timeText}</AppText>
        ) : null}
      </View>

      {labels.secondary ? (
        <AppText style={[styles.secondaryDate, { color: colors.subtext }]}>
          {labels.secondary}
        </AppText>
      ) : null}

      {showMeasurable && progressDisplay && measurable ? (
        <View style={styles.actionBlock}>
          {goalLabel ? (
            <AppText style={[styles.goalHint, { color: colors.subtext }]}>{goalLabel}</AppText>
          ) : null}

          <View style={styles.progressRow}>
            <Pressable
              onPress={measurable.onDecrement}
              disabled={!!measurable.busy || progressDisplay.recorded <= 0}
              style={({ pressed }) => [
                styles.stepBtn,
                { borderColor: colors.border },
                pressed && { opacity: 0.7 },
                (measurable.busy || progressDisplay.recorded <= 0) && { opacity: 0.4 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Decrease progress"
            >
              <Icon name={IconMinus} size={16} color={colors.text} stroke={2} />
            </Pressable>

            <View style={styles.valueCol}>
              <AppText
                style={[styles.progressValue, { color: colors.text }]}
                accessibilityLabel={progressDisplay.valueLabel}
              >
                {progressDisplay.target != null ? (
                  <>
                    {progressDisplay.recorded}
                    <AppText style={{ color: colors.subtext, fontWeight: '500' }}>
                      {' '}
                      / {progressDisplay.target}
                    </AppText>
                  </>
                ) : (
                  progressDisplay.recorded
                )}
              </AppText>
              <AppText style={[styles.unitHint, { color: colors.subtext }]}>
                {progressDisplay.unit}
              </AppText>
            </View>

            <Pressable
              onPress={measurable.onIncrement}
              disabled={
                !!measurable.busy ||
                (progressDisplay.target != null &&
                  progressDisplay.recorded >= progressDisplay.target)
              }
              style={({ pressed }) => [
                styles.stepBtn,
                { borderColor: colors.border, backgroundColor: accent + '18' },
                pressed && { opacity: 0.7 },
                (measurable.busy ||
                  (progressDisplay.target != null &&
                    progressDisplay.recorded >= progressDisplay.target)) && {
                  opacity: 0.4,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Increase progress"
            >
              <Icon name={IconPlus} size={16} color={accent} stroke={2} />
            </Pressable>
          </View>

          {progressDisplay.fillRatio != null ? (
            <View
              style={[styles.track, { backgroundColor: colors.border }]}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            >
              <View
                style={[
                  styles.fill,
                  {
                    backgroundColor: accent,
                    width: `${Math.round(progressDisplay.fillRatio * 100)}%`,
                  },
                ]}
              />
            </View>
          ) : null}

          {progressDisplay.goalMet || completed ? (
            <AppText style={[styles.doneHint, { color: accent }]}>Goal met</AppText>
          ) : null}
        </View>
      ) : null}

      {showBinary ? (
        <View style={styles.actionBlock}>
          {goalLabel ? (
            <AppText style={[styles.goalHint, { color: colors.subtext }]}>{goalLabel}</AppText>
          ) : null}

          {completed ? (
            <View style={styles.completedRow}>
              <View style={styles.completedStatus}>
                <Icon name={IconCheck} size={18} color={accent} stroke={2.2} />
                <AppText style={[styles.completedLabel, { color: accent }]}>
                  Completed
                </AppText>
              </View>
              <Pressable
                onPress={onToggleComplete}
                disabled={completing}
                hitSlop={8}
                style={({ pressed }) => [
                  styles.undoBtn,
                  pressed && { opacity: 0.65 },
                  completing && { opacity: 0.4 },
                ]}
                accessibilityRole="button"
                accessibilityState={{ busy: !!completing }}
                accessibilityLabel="Undo completion"
              >
                <AppText style={[styles.undoLabel, { color: colors.subtext }]}>Undo</AppText>
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={onToggleComplete}
              disabled={completing}
              style={({ pressed }) => [
                styles.primaryBtn,
                { backgroundColor: accent },
                pressed && { opacity: 0.88 },
                completing && { opacity: 0.55 },
              ]}
              accessibilityRole="button"
              accessibilityState={{ busy: !!completing }}
              accessibilityLabel="Mark complete"
            >
              <View style={styles.primaryBtnInner}>
                <Icon name={IconCheck} size={18} color="#FFFFFF" stroke={2.2} />
                <AppText style={styles.primaryBtnLabel}>Mark complete</AppText>
              </View>
            </Pressable>
          )}
        </View>
      ) : null}

      {actionError ? (
        <AppText style={{ color: colors.error, marginTop: 10 }}>{actionError}</AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 14,
    marginBottom: 20,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  primaryDate: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
    lineHeight: 22,
  },
  time: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
    flexShrink: 0,
  },
  secondaryDate: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  actionBlock: {
    marginTop: 14,
  },
  primaryBtn: {
    alignSelf: 'stretch',
    borderRadius: 12,
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  primaryBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryBtnLabel: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  completedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
    gap: 12,
  },
  completedStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  completedLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  undoBtn: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    minHeight: 44,
    justifyContent: 'center',
  },
  undoLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  goalHint: {
    fontSize: 13,
    marginBottom: 10,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  valueCol: {
    alignItems: 'center',
    flexShrink: 1,
    paddingHorizontal: 8,
  },
  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressValue: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  unitHint: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  track: {
    marginTop: 12,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 2,
  },
  doneHint: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});
