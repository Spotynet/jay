import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { IconCheck, IconMinus, IconArrowUp } from 'tabler-icons-react-native';
import { useTheme } from '../../context/ThemeContext';
import { Icon } from '../ui/Icon';
import { ENTITY_ICONS } from '../../constants/entityIcons';
import { AgendaItem } from '../../utils/timelineLayout';
import { useTimelineTokens } from '../../layout/useTimelineTokens';
import { NutrientInlineValue } from './NutrientInlineValue';

interface TimelineEventCardProps {
  item: AgendaItem;
  onPress?: () => void;
  /** Compact two-column untimed checklist cell */
  compact?: boolean;
  /**
   * When the untimed section mixes item types, show a small leading type icon
   * (only if there is no completion control, or beside it for disambiguation).
   * Habit-only / single-type groups omit the decorative category icon.
   */
  showTypeIcon?: boolean;
  /** Brief scroll-to destination emphasis (scheduled cards only). */
  highlighted?: boolean;
}

const COMPLETE_MS = 180;
const COMPLETE_EASE = Easing.out(Easing.cubic);

function formatDuration(minutes?: number): string | null {
  if (!minutes || minutes <= 0) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

function buildSubtitle(item: AgendaItem): string {
  if (item.subtitle) return item.subtitle;
  const bits: string[] = [];
  const duration = formatDuration(item.durationMinutes);
  if (duration) bits.push(duration);
  if (item.projectName) bits.push(item.projectName);
  if (item.location) bits.push(item.location);
  if (item.type === 'finance' && item.timeRange) bits.push(item.timeRange);
  return bits.join(' · ');
}

function entityColorFor(item: AgendaItem, entityColors: any, fallback: string) {
  const entityKey = (
    item.type === 'journal' || item.type === 'finance' ? item.type : `${item.type}s`
  ) as string;
  return entityColors[entityKey] || fallback;
}

type UntimedChecklistCardProps = {
  item: AgendaItem;
  onPress?: () => void;
  showTypeIcon: boolean;
  entityColor: string;
  cardBg: string;
  borderColor: string;
  muted: string;
  textColor: string;
  icon: any;
};

/** Compact “No time” cell with a short completion-state animation. */
function UntimedChecklistCard({
  item,
  onPress,
  showTypeIcon,
  entityColor,
  cardBg,
  borderColor,
  muted,
  textColor,
  icon,
}: UntimedChecklistCardProps) {
  const T = useTimelineTokens();
  const reduceMotion = useReducedMotion();
  const completed = !!item.isCompleted;
  const canToggle = (item.type === 'task' || item.type === 'habit') && !!item.onToggle;
  const checkboxSize = T.untimedCheckboxSize;
  const iconSize = T.untimedIconSize;
  const typeIconVisible = showTypeIcon;

  const progress = useSharedValue(completed ? 1 : 0);
  const pulse = useSharedValue(1);
  const skipMountAnim = useRef(true);
  const prevCompleted = useRef(completed);

  useEffect(() => {
    if (skipMountAnim.current) {
      skipMountAnim.current = false;
      prevCompleted.current = completed;
      progress.value = completed ? 1 : 0;
      pulse.value = 1;
      return;
    }
    if (prevCompleted.current === completed) return;
    prevCompleted.current = completed;

    const duration = reduceMotion ? 0 : COMPLETE_MS;
    progress.value = withTiming(completed ? 1 : 0, {
      duration,
      easing: COMPLETE_EASE,
    });

    if (completed && !reduceMotion) {
      pulse.value = withSequence(
        withTiming(1.08, { duration: 90, easing: COMPLETE_EASE }),
        withTiming(1, { duration: 90, easing: COMPLETE_EASE }),
      );
    } else {
      pulse.value = withTiming(1, { duration: reduceMotion ? 0 : 100, easing: COMPLETE_EASE });
    }
  }, [completed, reduceMotion, progress, pulse]);

  const boxAnimStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(progress.value, [0, 1], [muted, entityColor]),
    transform: [{ scale: pulse.value }],
  }));

  const fillAnimStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  const checkAnimStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.65 + 0.35 * progress.value }],
  }));

  const titleAnimStyle = useAnimatedStyle(() => ({
    color: interpolateColor(progress.value, [0, 1], [textColor, muted]),
  }));

  const accessibilityLabel = `${item.title}${completed ? ', completed' : ''}`;

  return (
    <View
        style={[
          styles.untimedCard,
          {
            backgroundColor: cardBg,
            borderColor,
            minHeight: T.untimedCardMinHeight,
            borderRadius: T.untimedCardRadius,
            paddingHorizontal: T.untimedCardPaddingH,
            paddingVertical: T.untimedCardPaddingV,
          },
        ]}
      >
      {canToggle ? (
        <Pressable
          style={[
            styles.checkboxHit,
            {
              width: checkboxSize,
              height: checkboxSize,
            },
          ]}
          onPress={item.onToggle}
          // Modest hit area only — avoid overlapping neighbor cards/title.
          hitSlop={{ top: 4, bottom: 4, left: 2, right: 2 }}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: completed }}
          accessibilityLabel={`Mark ${item.title} ${completed ? 'incomplete' : 'complete'}`}
        >
          <Animated.View
            style={[
              styles.checkbox,
              {
                width: checkboxSize,
                height: checkboxSize,
                borderRadius: checkboxSize / 2,
              },
              boxAnimStyle,
            ]}
          >
            <Animated.View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFill,
                {
                  borderRadius: checkboxSize / 2,
                  backgroundColor: entityColor,
                },
                fillAnimStyle,
              ]}
            />
            <Animated.View style={checkAnimStyle} pointerEvents="none">
              <Icon name={IconCheck} size={9} color={cardBg} stroke={2.5} />
            </Animated.View>
          </Animated.View>
        </Pressable>
      ) : null}

      {typeIconVisible ? (
        <View
          style={[
            styles.untimedTypeIcon,
            {
              width: iconSize,
              height: iconSize,
              marginLeft: canToggle ? 6 : 0,
            },
          ]}
          accessible={false}
          importantForAccessibility="no"
        >
          <Icon
            name={icon}
            size={iconSize}
            color={completed ? muted : entityColor}
            stroke={1.6}
          />
        </View>
      ) : null}

      <Pressable
        onPress={onPress}
        disabled={!onPress}
        style={[styles.untimedTitlePress, { marginLeft: typeIconVisible || canToggle ? 6 : 0 }]}
        accessibilityRole={onPress ? 'button' : undefined}
        accessibilityLabel={accessibilityLabel}
      >
        <Animated.Text
          style={[
            styles.untimedTitle,
            { fontSize: T.untimedTitleSize },
            titleAnimStyle,
            completed && { textDecorationLine: 'line-through' },
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item.title}
        </Animated.Text>
      </Pressable>
    </View>
  );
}

/**
 * Native-first horizontal card.
 * Scheduled: [icon] [title…] [○]
 * Untimed checklist: [○] [title…]  — no trailing duplicate control.
 */
export function TimelineEventCard({
  item,
  onPress,
  compact = false,
  showTypeIcon = false,
  highlighted = false,
}: TimelineEventCardProps) {
  const { colors, entityColors, isDark } = useTheme();
  const T = useTimelineTokens();
  const entityColor = entityColorFor(item, entityColors, colors.accent);
  const icon = item.icon || ENTITY_ICONS[item.type as keyof typeof ENTITY_ICONS];
  const showCompleted = !!item.isCompleted;
  const canToggle = (item.type === 'task' || item.type === 'habit') && !!item.onToggle;
  const subtitle = buildSubtitle(item);
  const hasNutrition = !!item.nutrition;

  const scheduledBg = isDark ? '#292C32' : colors.surface;
  // Quieter than scheduled cards — soft lift over page charcoal, no loud border.
  const untimedBg = isDark ? '#25272C' : colors.surface;
  const cardBg = compact ? untimedBg : scheduledBg;
  const borderColor = highlighted
    ? entityColor
    : compact
      ? isDark
        ? 'rgba(255,255,255,0.03)'
        : 'rgba(0,0,0,0.04)'
      : isDark
        ? 'rgba(255,255,255,0.04)'
        : colors.border;
  const muted = colors.subtext;

  const checkboxSize = compact ? T.untimedCheckboxSize : T.scheduledCheckboxSize;
  const iconSize = compact ? T.untimedIconSize : T.scheduledIconSize;
  const iconBox = compact ? T.untimedIconContainer : T.scheduledIconContainer;

  const showBadge =
    !compact &&
    !!item.badge &&
    !(canToggle && item.badge === 'check');

  const accessibilityLabel = `${item.title}${subtitle ? `, ${subtitle}` : ''}${
    showCompleted ? ', completed' : ''
  }`;

  // ── Untimed checklist cell ─────────────────────────────────────────────
  if (compact) {
    return (
      <UntimedChecklistCard
        item={item}
        onPress={onPress}
        showTypeIcon={showTypeIcon}
        entityColor={entityColor}
        cardBg={cardBg}
        borderColor={borderColor}
        muted={muted}
        textColor={colors.text}
        icon={icon}
      />
    );
  }

  // ── Scheduled timeline card ────────────────────────────────────────────
  return (
    <View
      style={[
        styles.scheduledCard,
        {
          backgroundColor: cardBg,
          borderColor,
          borderWidth: highlighted ? 1.5 : StyleSheet.hairlineWidth,
          opacity: showCompleted ? 0.78 : 1,
          minHeight: T.scheduledCardMinHeight,
          borderRadius: T.scheduledCardRadius,
          paddingHorizontal: T.scheduledCardPaddingH,
          paddingVertical: T.scheduledCardPaddingV,
        },
      ]}
    >
      <Pressable
        onPress={onPress}
        disabled={!onPress}
        style={styles.pressFlex}
        accessibilityRole={onPress ? 'button' : undefined}
        accessibilityLabel={accessibilityLabel}
      >
        <View style={styles.innerRow}>
          <View
            style={[
              styles.iconBox,
              {
                width: iconBox,
                height: iconBox,
                borderRadius: iconBox / 2,
                backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
              },
            ]}
          >
            <Icon
              name={icon}
              size={iconSize}
              color={showCompleted ? muted : entityColor}
              stroke={1.6}
            />
            {showBadge ? (
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor:
                      item.badge === 'up'
                        ? '#B8A4F0'
                        : item.badge === 'check'
                          ? entityColor
                          : colors.surfaceElevated,
                    borderColor: cardBg,
                  },
                ]}
                accessible={false}
                importantForAccessibility="no"
              >
                <Icon
                  name={
                    item.badge === 'up'
                      ? IconArrowUp
                      : item.badge === 'check'
                        ? IconCheck
                        : IconMinus
                  }
                  size={9}
                  color={item.badge === 'up' || item.badge === 'check' ? '#1D1E22' : muted}
                  stroke={2.2}
                />
              </View>
            ) : null}
          </View>

          <View style={[styles.body, { marginLeft: 8 }]}>
            <Text
              style={[
                styles.scheduledTitle,
                { color: colors.text, fontSize: T.scheduledTitleSize },
                showCompleted && { textDecorationLine: 'line-through', color: muted },
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.title}
            </Text>

            {hasNutrition ? (
              <View style={styles.nutritionRow}>
                <NutrientInlineValue
                  kind="calories"
                  value={item.nutrition!.calories}
                  textColor={muted}
                  size="sm"
                />
                <NutrientInlineValue
                  kind="fat"
                  value={item.nutrition!.fat}
                  textColor={muted}
                  size="sm"
                />
                <NutrientInlineValue
                  kind="carbs"
                  value={item.nutrition!.carbs}
                  textColor={muted}
                  size="sm"
                />
                <NutrientInlineValue
                  kind="protein"
                  value={item.nutrition!.protein}
                  textColor={muted}
                  size="sm"
                />
              </View>
            ) : subtitle ? (
              <Text
                style={[styles.subtitle, { color: muted, fontSize: T.scheduledSubtitleSize }]}
                numberOfLines={1}
              >
                {subtitle}
              </Text>
            ) : null}
          </View>
        </View>
      </Pressable>

      {canToggle ? (
        <Pressable
          style={[
            styles.checkbox,
            {
              width: checkboxSize,
              height: checkboxSize,
              borderRadius: checkboxSize / 2,
              borderColor: showCompleted ? entityColor : muted,
              backgroundColor: showCompleted ? entityColor : 'transparent',
              marginLeft: 8,
            },
          ]}
          onPress={item.onToggle}
          hitSlop={10}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: showCompleted }}
          accessibilityLabel={`Mark ${item.title} ${showCompleted ? 'incomplete' : 'complete'}`}
        >
          {showCompleted ? (
            <Icon name={IconCheck} size={11} color={cardBg} stroke={2.5} />
          ) : null}
        </Pressable>
      ) : (
        <View style={{ width: checkboxSize, marginLeft: 8, flexShrink: 0 }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  untimedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    // Intrinsic width for horizontal scroll row (clamped by parent).
    alignSelf: 'flex-start',
  },
  untimedTitlePress: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  untimedTitle: {
    fontWeight: '500',
  },
  untimedTypeIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkboxHit: {
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'visible',
  },
  scheduledCard: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    width: '100%',
    minWidth: 0,
    borderWidth: StyleSheet.hairlineWidth,
  },
  pressFlex: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  innerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    minWidth: 0,
  },
  iconBox: {
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'visible',
  },
  badge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  scheduledTitle: {
    fontWeight: '600',
    letterSpacing: -0.15,
  },
  subtitle: {
    fontWeight: '400',
    marginTop: 2,
  },
  nutritionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 4,
  },
  checkbox: {
    borderWidth: 1.25,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});
