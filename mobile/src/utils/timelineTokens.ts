/**
 * Shared daily-timeline layout tokens.
 * Hour markers are START boundaries of intervals:
 * [ time label ] [ rail / add ] [ flexible content ]
 */
const timeColumnWidth = 44;
const railColumnWidth = 28;
const timelineContentGap = 10;

export const TIMELINE_TOKENS = {
  pageInset: 16,

  timeColumnWidth,
  railColumnWidth,
  timelineContentGap,

  railCenterX: timeColumnWidth + railColumnWidth / 2,
  contentOffsetX: timeColumnWidth + railColumnWidth + timelineContentGap,

  /** Distance between consecutive empty-hour boundaries. */
  emptyHourHeight: 44,
  /** Overlay strip for label / + / guide at the interval start (does not add to content height). */
  boundaryHeight: 28,
  /**
   * Visible clearance above the first card and below the last card
   * in a populated interval (applied once around the stack).
   */
  intervalPadVertical: 10,
  /** Muted numeric count beside type icons in the hour header. */
  headerCountFontSize: 11,
  /** Small type icon in the hour-header type summary. */
  headerTypeIconSize: 13,
  /** Gap between a type icon and its count. */
  headerTypeIconGap: 4,
  /** Gap between category groups in the type summary. */
  headerTypeGroupGap: 10,
  /** Gap between the flexible hour guide and the type summary. */
  headerGuideCountGap: 8,
  cardGap: 8,

  // Untimed ("No time") checklist — single horizontal scroll row
  untimedCardGap: 7,
  untimedCardMinHeight: 34,
  untimedCardRadius: 9,
  untimedCardPaddingH: 9,
  untimedCardPaddingV: 3,
  untimedCardMinWidth: 120,
  untimedCardMaxWidth: 168,
  untimedIconSize: 13,
  untimedIconContainer: 14,
  untimedTitleSize: 12,
  untimedCheckboxSize: 15,
  /** Subtle edge fade width for horizontal overflow. */
  untimedEdgeFadeWidth: 20,
  /** Gap after untimed row before timeline. */
  untimedSectionBottom: 10,

  // Scheduled cards — native iOS horizontal row (compact density)
  scheduledCardMinHeight: 46,
  scheduledCardRadius: 14,
  scheduledCardPaddingH: 9,
  scheduledCardPaddingV: 7,
  scheduledIconSize: 17,
  scheduledIconContainer: 26,
  scheduledTitleSize: 15,
  scheduledSubtitleSize: 12,
  scheduledCheckboxSize: 19,
  chevronSize: 16,
  badgeSize: 14,

  addIconSize: 11,
  addIconStroke: 1.2,
  addMaskSize: 16,
  interactiveTargetSize: 44,

  summaryFontSize: 13,
  nutrientIconSize: 14,

  railThickness: 1,
  nowLineThickness: 1.5,
  nowBulbSize: 7,

  railColorDark: 'rgba(255,255,255,0.07)',
  railColorLight: 'rgba(0,0,0,0.07)',
  hourGuideColorDark: 'rgba(255,255,255,0.06)',
  hourGuideColorLight: 'rgba(0,0,0,0.06)',

  maxContentWidth: 480,
} as const;

export type TimelineTokens = typeof TIMELINE_TOKENS;

/** Mutable token bag for responsive overrides (phone values match TIMELINE_TOKENS). */
export type TimelineTokenValues = {
  [K in keyof TimelineTokens]: TimelineTokens[K] extends string ? string : number;
};
