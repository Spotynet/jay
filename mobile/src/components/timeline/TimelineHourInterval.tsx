import React, { ReactNode, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  TimelineGroup,
  countAgendaItemTypes,
  formatAgendaTypeSummary,
} from '../../utils/timelineLayout';
import { TIMELINE_TOKENS as T } from '../../utils/timelineTokens';
import { TimelineHourMarker } from './TimelineHourMarker';
import { TimelineTimeGroup } from './TimelineTimeGroup';

interface TimelineHourIntervalProps {
  hour: number;
  label: string;
  groups: TimelineGroup[];
  onAdd?: () => void;
  onItemPress?: (item: TimelineGroup['items'][number]) => void;
  onGroupPress?: (group: TimelineGroup) => void;
  nowIndicator?: ReactNode;
}

/**
 * Hour interval:
 * - Empty: compact height with horizontal guide in the header.
 * - Populated: header (time / + / flex guide + type summary) in normal flow,
 *   then 10px + event stack + 10px.
 */
export function TimelineHourInterval({
  label,
  groups,
  onAdd,
  onItemPress,
  onGroupPress,
  nowIndicator,
}: TimelineHourIntervalProps) {
  const populated = groups.length > 0;
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
      style={[styles.interval, !populated && { minHeight: T.emptyHourHeight }]}
      accessibilityLabel={
        populated && typeSummaryLabel
          ? `Hour ${label}, ${typeSummaryLabel}`
          : `Hour ${label}`
      }
    >
      <TimelineHourMarker
        label={label}
        onAdd={onAdd}
        showGuide={!populated}
        typeCounts={populated ? typeCounts : undefined}
      />

      {nowIndicator}

      {populated ? (
        <View style={styles.content}>
          <View style={styles.stack}>
            {groups.map((group) => (
              <TimelineTimeGroup
                key={group.id}
                group={group}
                onItemPress={onItemPress}
                onGroupPress={onGroupPress}
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
    // One shared outer clearance around the whole stack (not per card).
    paddingTop: T.intervalPadVertical,
    paddingBottom: T.intervalPadVertical,
  },
  stack: {
    width: '100%',
    minWidth: 0,
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    gap: T.cardGap,
    alignSelf: 'stretch',
    marginTop: 0,
    marginBottom: 0,
  },
});
