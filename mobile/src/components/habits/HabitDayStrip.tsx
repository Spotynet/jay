import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { IconCheck } from 'tabler-icons-react-native';
import { useTheme } from '../../context/ThemeContext';
import { AppText } from '../ui/AppText';
import { Icon } from '../ui/Icon';
import {
  HABIT_DAY_TILE,
  habitDayQuietFill,
  habitDaySubduedFill,
} from './habitDayTileTokens';

export type HabitDayStripMode = 'schedule' | 'activity';

/**
 * Visual indicator inside the fixed square.
 * Schedule uses only `check` | `empty`.
 * Activity maps domain states onto the full set.
 */
export type HabitDayIndicator =
  | 'check'
  | 'empty'
  | 'dash'
  | 'dot'
  | 'open'
  | 'future'
  | 'unknown';

export type HabitDayStripItem = {
  key: string;
  /** Short weekday label ABOVE the square (e.g. "Mon"). */
  label: string;
  accessibilityLabel: string;
  accessibilityHint?: string;
  indicator: HabitDayIndicator;
  onPress?: () => void;
  disabled?: boolean;
  accessibilityState?: { selected?: boolean; disabled?: boolean };
};

type HabitDayStripProps = {
  mode: HabitDayStripMode;
  days: HabitDayStripItem[];
  /** Habit accent fill / outline. */
  accent: string;
};

function squareShell(
  indicator: HabitDayIndicator,
  accent: string,
  quietFill: string,
  subduedFill: string,
): { backgroundColor: string; borderColor: string; borderWidth: number } {
  switch (indicator) {
    case 'check':
      return {
        backgroundColor: accent,
        borderColor: accent,
        borderWidth: HABIT_DAY_TILE.borderWidth,
      };
    case 'open':
      return {
        backgroundColor: 'transparent',
        borderColor: accent,
        borderWidth: HABIT_DAY_TILE.openBorderWidth,
      };
    case 'future':
    case 'unknown':
      return {
        backgroundColor: subduedFill,
        borderColor: 'transparent',
        borderWidth: HABIT_DAY_TILE.borderWidth,
      };
    case 'empty':
    case 'dash':
    case 'dot':
    default:
      return {
        backgroundColor: quietFill,
        borderColor: 'transparent',
        borderWidth: HABIT_DAY_TILE.borderWidth,
      };
  }
}

/**
 * Shared seven-day Habit strip — weekday label above a fixed rounded square.
 *
 * Layout ownership: an outer stretch host + equal-width View columns.
 * Pressable must NOT be the flex item — it content-sizes and left-clusters the row.
 */
export function HabitDayStrip({ mode: _mode, days, accent }: HabitDayStripProps) {
  const { colors, isDark } = useTheme();
  const quietFill = habitDayQuietFill(isDark);
  const subduedFill = habitDaySubduedFill(isDark);

  return (
    <View style={styles.host} collapsable={false}>
      <View style={styles.row} collapsable={false}>
        {days.map((day) => {
          const interactive = typeof day.onPress === 'function';
          const emphasize = day.indicator === 'check' || day.indicator === 'open';
          const shell = squareShell(day.indicator, accent, quietFill, subduedFill);

          const body = (
            <>
              <AppText
                style={[
                  styles.label,
                  {
                    color: emphasize ? colors.text : colors.subtext,
                    fontWeight: emphasize ? '700' : '600',
                  },
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
                allowFontScaling
              >
                {day.label}
              </AppText>

              <View
                collapsable={false}
                style={[styles.square, shell]}
                accessible={false}
                importantForAccessibility="no"
              >
                {day.indicator === 'check' ? (
                  <Icon
                    name={IconCheck}
                    size={HABIT_DAY_TILE.checkSize}
                    color={HABIT_DAY_TILE.onAccent}
                    stroke={HABIT_DAY_TILE.checkStroke}
                  />
                ) : null}
                {day.indicator === 'dash' ? (
                  <AppText style={[styles.dash, { color: colors.subtext }]}>−</AppText>
                ) : null}
                {day.indicator === 'dot' ? (
                  <View style={[styles.dot, { backgroundColor: colors.subtext }]} />
                ) : null}
                {day.indicator === 'unknown' ? (
                  <AppText style={[styles.unknown, { color: colors.subtext }]}>?</AppText>
                ) : null}
              </View>
            </>
          );

          return (
            <View key={day.key} style={styles.column} collapsable={false}>
              {interactive ? (
                <Pressable
                  onPress={day.onPress}
                  disabled={day.disabled}
                  style={({ pressed }) => [
                    styles.hit,
                    pressed && !day.disabled && styles.pressed,
                    day.disabled && styles.disabled,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={day.accessibilityLabel}
                  accessibilityHint={day.accessibilityHint}
                  accessibilityState={day.accessibilityState}
                >
                  {body}
                </Pressable>
              ) : (
                <View
                  style={styles.hit}
                  accessible
                  accessibilityRole="text"
                  accessibilityLabel={day.accessibilityLabel}
                >
                  {body}
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  /** Breaks content-sized percentage collapse against ScrollView parents. */
  host: {
    alignSelf: 'stretch',
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    alignSelf: 'stretch',
    width: '100%',
    gap: HABIT_DAY_TILE.columnGap,
    paddingHorizontal: HABIT_DAY_TILE.rowPadH,
    paddingTop: HABIT_DAY_TILE.rowPadTop,
    paddingBottom: HABIT_DAY_TILE.rowPadBottom,
  },
  /**
   * Layout-owning equal-width column (plain View — not Pressable).
   * flexBasis: 0 shares remaining width instead of intrinsic square width.
   */
  column: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    minWidth: 0,
    alignItems: 'center',
  },
  /** Full-column press target; does not carry flex width. */
  hit: {
    width: '100%',
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: HABIT_DAY_TILE.labelToTileGap,
  },
  label: {
    fontSize: HABIT_DAY_TILE.labelFontSize,
    textAlign: 'center',
  },
  square: {
    width: HABIT_DAY_TILE.size,
    height: HABIT_DAY_TILE.size,
    borderRadius: HABIT_DAY_TILE.radius,
    flexGrow: 0,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dash: {
    fontSize: HABIT_DAY_TILE.dashFontSize,
    fontWeight: '600',
    lineHeight: HABIT_DAY_TILE.size - 4,
    textAlign: 'center',
  },
  unknown: {
    fontSize: HABIT_DAY_TILE.unknownFontSize,
    fontWeight: '700',
  },
  dot: {
    width: HABIT_DAY_TILE.dotSize,
    height: HABIT_DAY_TILE.dotSize,
    borderRadius: HABIT_DAY_TILE.dotSize / 2,
  },
  pressed: {
    opacity: 0.88,
  },
  disabled: {
    opacity: 0.45,
  },
});
