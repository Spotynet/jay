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
  /** Compact two-column untimed grid cell */
  compact?: boolean;
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

export function TimelineEventCard({ item, onPress, compact = false }: TimelineEventCardProps) {
  const { colors, entityColors, isDark } = useTheme();
  const entityColor = entityColorFor(item, entityColors, colors.accent);
  const icon = item.icon || ENTITY_ICONS[item.type as keyof typeof ENTITY_ICONS];
  const showCompleted = !!item.isCompleted;
  const canToggle = (item.type === 'task' || item.type === 'habit') && !!item.onToggle;
  const subtitle = buildSubtitle(item);
  const hasNutrition = !!item.nutrition;

  const cardBg = isDark ? '#292C32' : colors.surface;
  const borderColor = isDark ? 'rgba(255,255,255,0.04)' : colors.border;
  const titleColor = colors.text;
  const muted = colors.subtext;

  const checkboxSize = compact ? T.untimedCheckboxSize : T.scheduledCheckboxSize;
  const iconSize = compact ? T.untimedIconSize : T.scheduledIconSize;

  const cardStyle = [
    compact ? styles.untimedCard : styles.scheduledCard,
    {
      backgroundColor: cardBg,
      borderColor,
      opacity: showCompleted ? 0.78 : 1,
    },
  ];

  const accessibilityLabel = `${item.title}${subtitle ? `, ${subtitle}` : ''}${
    showCompleted ? ', completed' : ''
  }`;

  return (
    <View style={cardStyle}>
      {/* Card open/edit — separate from completion to avoid nested buttons on web */}
      <Pressable
        onPress={onPress}
        disabled={!onPress}
        style={({ pressed }) => [
          styles.mainPress,
          pressed && onPress ? { opacity: 0.85 } : null,
        ]}
        accessibilityRole={onPress ? 'button' : undefined}
        accessibilityLabel={accessibilityLabel}
      >
        <View
          style={[
            compact ? styles.untimedIconWrap : styles.scheduledIconWrap,
            !compact && {
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
          {!compact && item.badge ? (
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

        <View style={styles.body}>
          <Text
            style={[
              compact ? styles.untimedTitle : styles.scheduledTitle,
              { color: titleColor },
              showCompleted && { textDecorationLine: 'line-through', color: muted },
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.title}
          </Text>

          {!compact && hasNutrition ? (
            <View style={styles.nutritionRow}>
              <NutrientInlineValue kind="calories" value={item.nutrition!.calories} textColor={muted} size="sm" />
              <NutrientInlineValue kind="fat" value={item.nutrition!.fat} textColor={muted} size="sm" />
              <NutrientInlineValue kind="carbs" value={item.nutrition!.carbs} textColor={muted} size="sm" />
              <NutrientInlineValue kind="protein" value={item.nutrition!.protein} textColor={muted} size="sm" />
            </View>
          ) : !compact && subtitle ? (
            <Text style={[styles.subtitle, { color: muted }]} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
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
            },
          ]}
          onPress={item.onToggle}
          hitSlop={10}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: showCompleted }}
          accessibilityLabel={`Mark ${item.title} ${showCompleted ? 'incomplete' : 'complete'}`}
        >
          {showCompleted ? (
            <Icon name={IconCheck} size={compact ? 10 : 11} color={cardBg} stroke={2.5} />
          ) : null}
        </Pressable>
      ) : (
        <View style={{ width: checkboxSize }} />
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
    gap: 8,
    width: '100%',
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
    gap: 10,
  },
  mainPress: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
    gap: 8,
  },
  untimedIconWrap: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  scheduledIconWrap: {
    width: T.scheduledIconContainer,
    height: T.scheduledIconContainer,
    borderRadius: T.scheduledIconContainer / 2,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
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
    gap: 2,
    justifyContent: 'center',
  },
  untimedTitle: {
    fontSize: T.untimedTitleSize,
    fontWeight: '500',
    letterSpacing: -0.1,
  },
  scheduledTitle: {
    fontSize: T.scheduledTitleSize,
    fontWeight: '600',
    letterSpacing: -0.15,
  },
  subtitle: {
    fontSize: T.scheduledSubtitleSize,
    fontWeight: '400',
  },
  nutritionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    borderWidth: 1.25,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});
