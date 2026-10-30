import React, { useMemo, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  TimelineGroup,
  countAgendaItemTypes,
  formatAgendaTypeSummary,
} from '../../utils/timelineLayout';
import { useTimelineTokens } from '../../layout/useTimelineTokens';
import { TimelineHourMarker } from './TimelineHourMarker';
import { TimelineTimeGroup } from './TimelineTimeGroup';
import { TimelineDurationEndCard } from './TimelineDurationEndCard';
import {
  ConnectedEndCard,
  durationEndBoundsKey,
} from '../../utils/timelineConnectedDuration';

interface TimelineHourIntervalProps {
  /** Display label, e.g. "07:00" or "07:30". */
  label: string;
  groups: TimelineGroup[];
  onAdd?: () => void;
  onItemPress?: (item: TimelineGroup['items'][number]) => void;
  onGroupPress?: (group: TimelineGroup) => void;
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
  /** Derived END cards for this exact minute (below heading, before starts). */
  endCards?: ConnectedEndCard[];
  endCardAccentFor?: (endCard: ConnectedEndCard) => string;
  endCardIconFor?: (endCard: ConnectedEndCard) => unknown;
  contentLeft?: number;
  onEndCardPress?: (endCard: ConnectedEndCard) => void;
}

/**
 * Exact-time timeline section (o’clock or occupied non-o’clock).
 * Ordinary start cards and derived END cards both live in the content stack
 * so the block’s measured height includes them.
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
  indentByItemId,
  endCards = [],
  endCardAccentFor,
  endCardIconFor,
  contentLeft,
  onEndCardPress,
}: TimelineHourIntervalProps) {
  const T = useTimelineTokens();
  const endRefs = useRef<Record<string, View | null>>({});
  const hasEndCards = endCards.length > 0;
  const occupied = groups.length > 0 || hasEndCards;
  const typeCounts = useMemo(
    () => countAgendaItemTypes(groups.flatMap((g) => g.items)),
    [groups],
  );
  const typeSummaryLabel = useMemo(
    () => formatAgendaTypeSummary(typeCounts),
    [typeCounts],
  );

  const reportEndBounds = (itemId: string) => {
    if (!onItemBounds) return;
    const node = endRefs.current[itemId];
    const anchor = contentAnchorRef?.current;
    if (!node || !anchor) return;
    node.measureLayout(
      anchor as unknown as number,
      (x, y, width, height) => {
        if (height > 0 && width > 0) {
          onItemBounds(durationEndBoundsKey(itemId), y, height, x, width);
        }
      },
      () => {},
    );
  };

  const padLeft = contentLeft ?? T.pageInset + T.contentOffsetX;

  return (
    <View
      style={[styles.interval, !occupied && { minHeight: T.emptyHourHeight }]}
      accessibilityLabel={
        occupied && typeSummaryLabel
          ? `${label}, ${typeSummaryLabel}`
          : hasEndCards
            ? `${label}, ends`
            : label
      }
    >
      <TimelineHourMarker
        label={label}
        onAdd={onAdd}
        showGuide={!occupied}
        typeCounts={occupied && groups.length > 0 ? typeCounts : undefined}
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
            {/* Endings before starts at the same timestamp. */}
            {hasEndCards ? (
              <View
                style={[
                  styles.endStack,
                  {
                    gap: T.cardGap,
                    paddingLeft: padLeft,
                    paddingRight: T.pageInset,
                  },
                ]}
              >
                {endCards.map((endCard) => {
                  const accent = endCardAccentFor?.(endCard) ?? '#5B8DEF';
                  return (
                    <View
                      key={`end-card-${endCard.itemId}`}
                      collapsable={false}
                      ref={(r) => {
                        endRefs.current[endCard.itemId] = r;
                      }}
                      onLayout={() => reportEndBounds(endCard.itemId)}
                    >
                      <TimelineDurationEndCard
                        endCard={endCard}
                        accent={accent}
                        indent={0}
                        icon={endCardIconFor?.(endCard)}
                        onPress={
                          onEndCardPress ? () => onEndCardPress(endCard) : undefined
                        }
                      />
                    </View>
                  );
                })}
              </View>
            ) : null}

            {groups.map((group) => (
              <TimelineTimeGroup
                key={group.id}
                group={group}
                onItemPress={onItemPress}
                onGroupPress={onGroupPress}
                contentAnchorRef={contentAnchorRef}
                onItemBounds={onItemBounds}
                highlightedItemId={highlightedItemId}
                indentByItemId={indentByItemId}
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
  endStack: {
    width: '100%',
    minWidth: 0,
    flexDirection: 'column',
    alignItems: 'stretch',
  },
});
