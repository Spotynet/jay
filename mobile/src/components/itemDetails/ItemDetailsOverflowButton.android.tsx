import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MenuView } from '@expo/ui/community/menu';
import { IconDots } from 'tabler-icons-react-native';
import { useTheme } from '../../context/ThemeContext';
import { Icon } from '../ui/Icon';
import type { DetailsOverflowAction } from './detailsOverflowTypes';

type Props = {
  actions: DetailsOverflowAction[];
  accessibilityLabel?: string;
};

/**
 * Android More control: Expo UI MenuView (Compose DropdownMenu) on tap.
 * Trigger uses a horizontal dots glyph — SF Symbols are iOS-only.
 */
export function ItemDetailsOverflowButton({
  actions,
  accessibilityLabel = 'More options',
}: Props) {
  const { colors } = useTheme();

  return (
    <MenuView
      style={styles.host}
      shouldOpenOnLongPress={false}
      actions={actions.map((action) => ({
        id: action.key,
        title: action.label,
        attributes: {
          destructive: !!action.destructive,
          disabled: !!action.disabled,
        },
      }))}
      onPressAction={({ nativeEvent }) => {
        const action = actions.find((a) => a.key === nativeEvent.event);
        if (!action || action.disabled) return;
        requestAnimationFrame(() => action.onPress());
      }}
    >
      <View
        style={styles.trigger}
        accessible
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        <Icon name={IconDots} size={20} color={colors.text} stroke={1.8} />
      </View>
    </MenuView>
  );
}

const styles = StyleSheet.create({
  host: {
    width: 44,
    height: 44,
  },
  trigger: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
