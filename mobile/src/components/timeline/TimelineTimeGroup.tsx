import React, { useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { TimelineGroup } from '../../utils/timelineLayout';
import { useTimelineTokens } from '../../layout/useTimelineTokens';
import { TimelineGroupSummary } from './TimelineGroupSummary';
import { TimelineEventCard } from './TimelineEventCard';

interface TimelineTimeGroupProps {
  group: TimelineGroup;
  onItemPress?: (item: TimelineGroup['items'][number]) => void;
  onGroupPress?: (group: TimelineGroup) => void;
  /** Anchor view in scroll-content coordinates (timeline body). */
  contentAnchorRef?: React.RefObject<View | null>;
  onItemBounds?: (
    itemId: string,
    y: number,
    height: number,
    x: number,
    width: number,
  ) => void;
  highlightedItemId?: string | null;
  /** Per-item left indent (px) past active duration lines. */
  indentByItemId?: Record<string, number>;
}

/**
 * Card stack for one exact-time group.
 * Section headers live on the parent section — no secondary time label here.
 * Cards use the normal content width; optional indent clears connected rails.
 */
export function TimelineTimeGroup({
  group,
  onItemPress,
  onGroupPress,
  contentAnchorRef,
  onItemBounds,
  highlightedItemId,
  indentByItemId,
}: TimelineTimeGroupProps) {
  const T = useTimelineTokens();
  const showNutrition = !!group.nutrition;
  const itemRefs = useRef<Record<string, View | null>>({});

  const reportBounds = (itemId: string) => {
    if (!onItemBounds) return;
    const node = itemRefs.current[itemId];
    const anchor = contentAnchorRef?.current;
    if (!node || !anchor) return;
    node.measureLayout(
      anchor as unknown as number,
      (x, y, width, height) => {
        if (height > 0 && width > 0) onItemBounds(itemId, y, height, x, width);
      },
      () => {},
    );
  };

  // Normal timeline content width after the time axis (no permanent gutter).
  const contentPadLeft = T.pageInset + T.contentOffsetX;

  return (
    <View
      style={[
        styles.stack,
        {
          gap: T.cardGap,
          paddingLeft: contentPadLeft,
          paddingRight: T.pageInset,
        },
      ]}
      accessibilityRole="summary"
      accessibilityLabel={`Entries at ${group.timestampLabel}`}
    >
      {showNutrition ? (
        <TimelineGroupSummary
          nutrition={group.nutrition}
          onPress={onGroupPress ? () => onGroupPress(group) : undefined}
        />
      ) : null}
      {group.items.map((item) => {
        const indent = indentByItemId?.[item.id] ?? 0;
        return (
          <View
            key={item.id}
            collapsable={false}
            ref={(r) => {
              itemRefs.current[item.id] = r;
            }}
            onLayout={() => reportBounds(item.id)}
            style={indent > 0 ? { marginLeft: indent } : undefined}
          >
            <TimelineEventCard
              item={item}
              highlighted={highlightedItemId === item.id}
              onPress={() => onItemPress?.(item)}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    width: '100%',
    minWidth: 0,
  },
});
