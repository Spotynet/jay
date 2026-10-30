import React from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useTimelineTokens } from '../../layout/useTimelineTokens';
import {
  ConnectedEndCard,
  durationEndBoundsKey,
} from '../../utils/timelineConnectedDuration';
import { ENTITY_ICONS } from '../../constants/entityIcons';
import { Icon } from '../ui/Icon';

export { durationEndBoundsKey } from '../../utils/timelineConnectedDuration';

type TimelineDurationEndCardProps = {
  endCard: ConnectedEndCard;
  accent: string;
  indent?: number;
  icon?: unknown;
  /** Locate matching start card (does not open details / mutate). */
  onPress?: () => void;
};

/**
 * Full-width scheduled-end card. Tap reveals/highlights the matching start.
 * Opaque so continuing rails can pass behind the surface only.
 */
export function TimelineDurationEndCard({
  endCard,
  accent,
  indent = 0,
  icon,
  onPress,
}: TimelineDurationEndCardProps) {
  const { colors, isDark } = useTheme();
  const T = useTimelineTokens();
  const muted = colors.subtext;
  const cardBg = isDark ? '#25282E' : colors.surface;
  const iconBox = T.scheduledIconContainer;
  const iconSize = T.scheduledIconSize;
  const typeIcon =
    icon ||
    ENTITY_ICONS[endCard.type as keyof typeof ENTITY_ICONS] ||
    ENTITY_ICONS.task;

  const a11yLabel = `${endCard.title}, scheduled end at ${endCard.endTimeLabel}. Shows the activity’s start.`;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityLabel={a11yLabel}
      accessibilityHint={onPress ? 'Reveals and highlights the start card' : undefined}
      style={[
        styles.card,
        {
          marginLeft: indent,
          alignSelf: 'stretch',
          width: '100%',
          maxWidth: '100%',
          backgroundColor: cardBg,
          borderColor: isDark ? `${accent}44` : `${accent}55`,
          borderRadius: T.scheduledCardRadius,
          paddingHorizontal: T.scheduledCardPaddingH,
          paddingVertical: T.scheduledCardPaddingV,
          minHeight: T.scheduledCardMinHeight,
        },
      ]}
    >
      <View style={styles.innerRow} pointerEvents="none">
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
            name={typeIcon}
            size={iconSize}
            color={endCard.isCompleted ? muted : accent}
            stroke={1.6}
          />
        </View>

        <View style={[styles.body, { marginLeft: 8 }]}>
          <Text
            style={[
              styles.title,
              {
                color: endCard.isCompleted ? muted : colors.text,
                fontSize: T.scheduledTitleSize,
              },
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {endCard.title}
          </Text>
          <Text
            style={[styles.subtitle, { color: muted, fontSize: T.scheduledSubtitleSize }]}
            numberOfLines={1}
          >
            Scheduled end
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
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
  },
  body: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  title: {
    fontWeight: '600',
    letterSpacing: -0.15,
  },
  subtitle: {
    marginTop: 2,
    fontWeight: '400',
  },
});
