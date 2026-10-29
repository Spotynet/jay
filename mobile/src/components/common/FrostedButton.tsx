import React from 'react';
import { TablerIcon } from 'tabler-icons-react-native';
import { ActionButton } from './ActionButton';

interface FrostedButtonProps {
  icon: TablerIcon;
  onPress: () => void;
}

/**
 * @deprecated Prefer ActionButton.
 * Kept as a thin alias — the old BlurView “frosted” treatment was a fake glass
 * imitation and is intentionally removed.
 */
export const FrostedButton = ({ icon, onPress }: FrostedButtonProps) => (
  <ActionButton icon={icon} onPress={onPress} size={44} accessibilityLabel="Action" />
);
