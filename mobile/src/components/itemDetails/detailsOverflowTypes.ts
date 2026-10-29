/**
 * Shared overflow action shape for item-details More menu.
 * Presentation is platform-specific; handlers stay identical.
 */
export type DetailsOverflowAction = {
  key: string;
  label: string;
  destructive?: boolean;
  disabled?: boolean;
  /** SF Symbol name for iOS menu rows (ignored on Android/web). */
  systemImage?: string;
  onPress: () => void;
};
