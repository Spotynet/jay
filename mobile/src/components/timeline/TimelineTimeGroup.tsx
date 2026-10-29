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
  onItemBounds?: (itemId: string, y: number, height: number) => void;
  highlightedItemId?: string | null;
}

/**
 * Card stack for one exact-time group.
 * Section headers (time label / add / counts) live on the parent section —
 * this component never draws a secondary time label.
 */
export function TimelineTimeGroup({
  group,
  onItemPress,
  onGroupPress,
  contentAnchorRef,
  onItemBounds,
  highlightedItemId,
}: TimelineTimeGroupProps) {
  const T = useTimelineTokens();
  const showNutrition = !!group.nutrition;
  const itemRefs = useRef<Record<string, View | null>>({});

  const reportBounds = (itemId: string) => {
    if (!onItemBounds) return;
    const node = itemRefs.current[itemId];
    const anchor = contentAnchorRef?.current;
    if (!node || !anchor) return;
    // Relative to timeline body so Y matches ScrollView content coordinates.
    node.measureLayout(
      anchor as unknown as number,
      (_x, y, _w, height) => {
        if (height > 0) onItemBounds(itemId, y, height);
      },
      () => {
        // Fallback: ignore — recompute will retry on next layout/scroll.
      },
    );
  };

  return (
    <View
      style={[
        styles.stack,
        {
          gap: T.cardGap,
          paddingLeft: T.pageInset + T.contentOffsetX,
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
      {group.items.map((item) => (
        <View
          key={item.id}
          collapsable={false}
          ref={(r) => {
            itemRefs.current[item.id] = r;
          }}
          onLayout={() => reportBounds(item.id)}
        >
          <TimelineEventCard
            item={item}
            highlighted={highlightedItemId === item.id}
            onPress={() => onItemPress?.(item)}
          />
        </View>
      ))}
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
