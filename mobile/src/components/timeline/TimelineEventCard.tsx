import React from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import { IconCheck, IconMinus, IconArrowUp } from 'tabler-icons-react-native';
import { useTheme } from '../../context/ThemeContext';
import { Icon } from '../ui/Icon';
import { ENTITY_ICONS } from '../../constants/entityIcons';
import { AgendaItem } from '../../utils/timelineLayout';
import { TIMELINE_TOKENS as T } from '../../utils/timelineTokens';
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
}

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
}: TimelineEventCardProps) {
  const { colors, entityColors, isDark } = useTheme();
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
  const borderColor = compact
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
    // Habit-only / single-type: no decorative type icon.
    // Mixed types: small inline type icon to distinguish; never a trailing checkbox.
    const typeIconVisible = showTypeIcon;

    return (
      <View
        style={[
          styles.untimedCard,
          {
            backgroundColor: cardBg,
            borderColor,
          },
        ]}
      >
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
              },
            ]}
            onPress={item.onToggle}
            // Modest hit area only — avoid overlapping neighbor cards/title.
            hitSlop={{ top: 4, bottom: 4, left: 2, right: 2 }}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: showCompleted }}
            accessibilityLabel={`Mark ${item.title} ${showCompleted ? 'incomplete' : 'complete'}`}
          >
            {showCompleted ? (
              <Icon name={IconCheck} size={9} color={cardBg} stroke={2.5} />
            ) : null}
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
              color={showCompleted ? muted : entityColor}
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
          <Text
            style={[
              styles.untimedTitle,
              { color: showCompleted ? muted : colors.text },
              showCompleted && { textDecorationLine: 'line-through' },
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.title}
          </Text>
        </Pressable>
      </View>
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
          opacity: showCompleted ? 0.78 : 1,
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

          <View style={[styles.body, { marginLeft: 10 }]}>
            <Text
              style={[
                styles.scheduledTitle,
                { color: colors.text },
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
              <Text style={[styles.subtitle, { color: muted }]} numberOfLines={1}>
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
              marginLeft: 10,
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
        <View style={{ width: checkboxSize, marginLeft: 10, flexShrink: 0 }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  untimedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: T.untimedCardMinHeight,
    borderRadius: T.untimedCardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: T.untimedCardPaddingH,
    paddingVertical: T.untimedCardPaddingV,
    // Intrinsic width for horizontal scroll row (clamped by parent).
    alignSelf: 'flex-start',
  },
  untimedTitlePress: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  untimedTitle: {
    fontSize: T.untimedTitleSize,
    fontWeight: '500',
  },
  untimedTypeIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  scheduledCard: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    width: '100%',
    minWidth: 0,
    minHeight: T.scheduledCardMinHeight,
    borderRadius: T.scheduledCardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: T.scheduledCardPaddingH,
    paddingVertical: T.scheduledCardPaddingV,
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
    width: T.badgeSize,
    height: T.badgeSize,
    borderRadius: T.badgeSize / 2,
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
    fontSize: T.scheduledTitleSize,
    fontWeight: '600',
    letterSpacing: -0.15,
  },
  subtitle: {
    fontSize: T.scheduledSubtitleSize,
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
