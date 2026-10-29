import { useMemo } from 'react';
import { TIMELINE_TOKENS, TimelineTokenValues } from '../utils/timelineTokens';
import { ResponsiveLayout, useResponsiveLayout } from './responsive';

/**
 * Resolve timeline layout tokens for the current width tier.
 * Phone classes return the base tokens unchanged (iPhone reference).
 */
export function resolveTimelineTokens(layout: ResponsiveLayout): TimelineTokenValues {
  if (layout.isPhone) {
    return { ...TIMELINE_TOKENS };
  }

  if (layout.deviceClass === 'smallTablet') {
    return {
      ...TIMELINE_TOKENS,
      pageInset: layout.pageInset,
      maxContentWidth: layout.contentMaxWidth,
      untimedCardGap: 8,
      untimedCardMinHeight: 38,
      untimedCardPaddingH: 11,
      untimedCardPaddingV: 5,
      untimedCardMinWidth: 136,
      untimedCardMaxWidth: 196,
      untimedTitleSize: 13,
      untimedCheckboxSize: 16,
      untimedIconSize: 14,
      untimedIconContainer: 15,
      untimedSectionBottom: 14,
      untimedEdgeFadeWidth: 22,
      scheduledCardMinHeight: 48,
      scheduledCardPaddingH: 11,
      scheduledCardPaddingV: 8,
      scheduledTitleSize: 16,
      scheduledSubtitleSize: 13,
      cardGap: 9,
      intervalPadVertical: 12,
      emptyHourHeight: 48,
    };
  }

  return {
    ...TIMELINE_TOKENS,
    pageInset: layout.pageInset,
    maxContentWidth: layout.contentMaxWidth,
    untimedCardGap: 9,
    untimedCardMinHeight: 40,
    untimedCardPaddingH: 12,
    untimedCardPaddingV: 6,
    untimedCardMinWidth: 148,
    untimedCardMaxWidth: 220,
    untimedTitleSize: 14,
    untimedCheckboxSize: 17,
    untimedIconSize: 14,
    untimedIconContainer: 16,
    untimedSectionBottom: 16,
    untimedEdgeFadeWidth: 24,
    scheduledCardMinHeight: 50,
    scheduledCardPaddingH: 11,
    scheduledCardPaddingV: 8,
    scheduledTitleSize: 16,
    scheduledSubtitleSize: 13,
    scheduledCheckboxSize: 20,
    cardGap: 10,
    intervalPadVertical: 12,
    emptyHourHeight: 50,
  };
}

export function useTimelineTokens(): TimelineTokenValues {
  const layout = useResponsiveLayout();
  return useMemo(() => resolveTimelineTokens(layout), [layout]);
}
