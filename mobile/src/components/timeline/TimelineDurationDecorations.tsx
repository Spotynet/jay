import React, { useMemo } from 'react';
import { View, StyleSheet, Text, Pressable, Alert } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useTimelineTokens } from '../../layout/useTimelineTokens';
import { AgendaItem } from '../../utils/timelineLayout';
import {
  ConnectedDurationLayout,
  ConnectedOverflowGroup,
  CONNECTED_RAIL_WIDTH,
  CardBounds,
  durationEndBoundsKey,
  visibleRailSegments,
  RailOccluder,
} from '../../utils/timelineConnectedDuration';
import { sectionIdForMinutes } from '../../utils/timelineInterval';

type TimelineDurationDecorationsProps = {
  layout: ConnectedDurationLayout;
  items: AgendaItem[];
  sectionYs: Record<string, number>;
  /** Measured opaque card surfaces in timeline-body coords. */
  cardBounds: Record<string, CardBounds>;
  entityColorFor: (item: AgendaItem) => string;
  onItemPress?: (item: AgendaItem) => void;
  layer?: 'under' | 'overflow';
};

/**
 * Duration rail strokes under cards. Occlusion uses measured card surfaces only
 * (never headings / block padding estimates) so rails stay visible in chrome gaps.
 */
export function TimelineDurationDecorations({
  layout,
  items,
  sectionYs,
  cardBounds,
  entityColorFor,
  onItemPress,
  layer = 'under',
}: TimelineDurationDecorationsProps) {
  const { colors, isDark } = useTheme();
  const T = useTimelineTokens();

  const byId = useMemo(() => {
    const map = new Map<string, AgendaItem>();
    for (const item of items) map.set(item.id, item);
    return map;
  }, [items]);

  const railWidth = Math.max(2, T.durationRailWidth ?? CONNECTED_RAIL_WIDTH);

  /**
   * Measured opaque card surfaces only (start + END). Never estimate from
   * section/heading/padding — that punched oversized gaps through chrome.
   */
  const measuredSurfaceOccluders = useMemo(() => {
    const list: Array<{ key: string; rect: RailOccluder }> = [];
    for (const [key, m] of Object.entries(cardBounds)) {
      if (!m || !(m.height > 0) || !(m.width > 0)) continue;
      list.push({
        key,
        rect: {
          left: m.x,
          right: m.x + m.width,
          top: m.y,
          bottom: m.y + m.height,
        },
      });
    }
    return list;
  }, [cardBounds]);

  const openOverflowGroup = (group: ConnectedOverflowGroup) => {
    const lines = group.memberIds.map((id) => {
      const item = byId.get(id);
      const rail = layout.rails.find((r) => r.itemId === id);
      const title = item?.title ?? id;
      const type = item?.type ?? 'item';
      const end = rail?.endCard?.endTimeLabel ?? '';
      return `• ${title} (${type})${end ? ` — ends ${end}` : ''}`;
    });
    const buttons = [
      ...group.memberIds.slice(0, 6).map((id) => {
        const item = byId.get(id);
        return {
          text: item?.title?.slice(0, 28) || id,
          onPress: () => {
            if (item && onItemPress) onItemPress(item);
          },
        };
      }),
      { text: 'Cancel', style: 'cancel' as const },
    ];
    Alert.alert(
      `${group.count} overlapping`,
      `${lines.join('\n')}\n\nEach item keeps its own schedule.`,
      buttons,
    );
  };

  if (layer === 'overflow') {
    if (layout.overflowGroups.length === 0) return null;
    return (
      <View pointerEvents="box-none" collapsable={false} style={StyleSheet.absoluteFill}>
        {layout.overflowGroups.map((group) => {
          const startId = sectionIdForMinutes(group.displayStartMinutes);
          const startY = sectionYs[startId];
          if (typeof startY !== 'number') return null;
          return (
            <Pressable
              key={group.key}
              onPress={() => openOverflowGroup(group)}
              accessibilityRole="button"
              accessibilityLabel={`${group.count} overlapping duration items. Opens list.`}
              hitSlop={6}
              style={[
                styles.overflowChip,
                {
                  left: T.pageInset + T.contentOffsetX + 8,
                  top: startY + 4,
                  backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.07)',
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.overflowText, { color: colors.subtext }]} numberOfLines={1}>
                +{group.count} more
              </Text>
            </Pressable>
          );
        })}
      </View>
    );
  }

  return (
    <View
      pointerEvents="none"
      collapsable={false}
      style={StyleSheet.absoluteFill}
      accessible={false}
      importantForAccessibility="no"
    >
      {layout.rails.map((rail) => {
        const measuredEnd = cardBounds[durationEndBoundsKey(rail.itemId)];
        const endY =
          measuredEnd && measuredEnd.height > 0 ? measuredEnd.y : rail.endY;
        if (!(endY > rail.startY + 1)) return null;

        const railLeft = rail.railX - railWidth / 2;
        const railRight = railLeft + railWidth;
        const ownEndKey = durationEndBoundsKey(rail.itemId);

        // Own END is the rail terminus (not an occluder). Own start sits above
        // startY and is filtered by the vertical window below.
        const occluders: RailOccluder[] = [];
        for (const { key, rect } of measuredSurfaceOccluders) {
          if (key === ownEndKey || key === rail.itemId) continue;
          if (rect.bottom <= rail.startY || rect.top >= endY) continue;
          occluders.push(rect);
        }

        const segments = visibleRailSegments(
          rail.startY,
          endY,
          occluders,
          railLeft,
          railRight,
        );
        if (segments.length === 0) return null;

        const item = byId.get(rail.itemId);
        const accent = (item ? entityColorFor(item) : null) || colors.accent || '#5B8DEF';
        const stroke = item?.isCompleted
          ? isDark
            ? 'rgba(255,255,255,0.35)'
            : 'rgba(0,0,0,0.28)'
          : accent;
        const opacity = item?.isCompleted ? 0.55 : 0.9;

        return (
          <View key={`connected-rail-${rail.itemId}`} collapsable={false}>
            {segments.map((seg, i) => (
              <View
                key={`seg-${rail.itemId}-${i}`}
                style={[
                  styles.rail,
                  {
                    left: railLeft,
                    top: seg.top,
                    height: seg.height,
                    width: railWidth,
                    backgroundColor: stroke,
                    opacity,
                    // Square caps — rounded ends protrude into masked gaps.
                    borderRadius: 0,
                  },
                ]}
              />
            ))}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  rail: {
    position: 'absolute',
  },
  overflowChip: {
    position: 'absolute',
    zIndex: 2,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    maxWidth: 140,
  },
  overflowText: {
    fontSize: 10,
    fontWeight: '600',
  },
});
