import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  TimelineGroup,
  countAgendaItemTypes,
  formatAgendaTypeSummary,
} from '../../utils/timelineLayout';
import { useTimelineTokens } from '../../layout/useTimelineTokens';
import { TimelineHourMarker } from './TimelineHourMarker';
import { TimelineTimeGroup } from './TimelineTimeGroup';

interface TimelineHourIntervalProps {
  /** Display label, e.g. "07:00" or "07:30". */
  label: string;
  groups: TimelineGroup[];
  onAdd?: () => void;
  onItemPress?: (item: TimelineGroup['items'][number]) => void;
  onGroupPress?: (group: TimelineGroup) => void;
  contentAnchorRef?: React.RefObject<View | null>;
  onItemBounds?: (itemId: string, y: number, height: number) => void;
  highlightedItemId?: string | null;
}

/**
 * Exact-time timeline section (o’clock or occupied non-o’clock).
 * - Empty: compact height with horizontal guide in the header.
 * - Occupied: full header (time / + / type summary) + dedicated card stack.
 * Counts and cards are local to this section’s exact minute only.
 */
export function TimelineHourInterval({
  label,
  groups,
  onAdd,
  onItemPress,
  onGroupPress,
  contentAnchorRef,
  onItemBounds,
  highlightedItemId,
}: TimelineHourIntervalProps) {
  const T = useTimelineTokens();
  const occupied = groups.length > 0;
  const typeCounts = useMemo(
    () => countAgendaItemTypes(groups.flatMap((g) => g.items)),
    [groups],
  );
  const typeSummaryLabel = useMemo(
    () => formatAgendaTypeSummary(typeCounts),
    [typeCounts],
  );

  return (
    <View
      style={[styles.interval, !occupied && { minHeight: T.emptyHourHeight }]}
      accessibilityLabel={
        occupied && typeSummaryLabel
          ? `${label}, ${typeSummaryLabel}`
          : label
      }
    >
      <TimelineHourMarker
        label={label}
        onAdd={onAdd}
        showGuide={!occupied}
        typeCounts={occupied ? typeCounts : undefined}
      />

      {occupied ? (
        <View
          style={[
            styles.content,
            {
              paddingTop: T.intervalPadVertical,
              paddingBottom: T.intervalPadVertical,
            },
          ]}
        >
          <View style={[styles.stack, { gap: T.cardGap }]}>
            {groups.map((group) => (
              <TimelineTimeGroup
                key={group.id}
                group={group}
                onItemPress={onItemPress}
                onGroupPress={onGroupPress}
                contentAnchorRef={contentAnchorRef}
                onItemBounds={onItemBounds}
                highlightedItemId={highlightedItemId}
              />
            ))}
          </View>
        </View>
      ) : (
        <View
          style={{ flexGrow: 1, minHeight: Math.max(0, T.emptyHourHeight - T.boundaryHeight) }}
          pointerEvents="none"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  interval: {
    width: '100%',
    flexDirection: 'column',
  },
  content: {
    width: '100%',
    minWidth: 0,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  stack: {
    width: '100%',
    minWidth: 0,
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    alignSelf: 'stretch',
    marginTop: 0,
    marginBottom: 0,
  },
});
