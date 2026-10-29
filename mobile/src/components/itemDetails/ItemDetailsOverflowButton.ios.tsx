import React from 'react';
import { StyleSheet } from 'react-native';
import { Host, Menu, Button, Image } from '@expo/ui/swift-ui';
import { accessibilityLabel as a11yLabelModifier } from '@expo/ui/swift-ui/modifiers';
import { useTheme } from '../../context/ThemeContext';
import type { DetailsOverflowAction } from './detailsOverflowTypes';

type Props = {
  actions: DetailsOverflowAction[];
  accessibilityLabel?: string;
};

/**
 * Native iOS More control: SwiftUI Menu with SF Symbol `ellipsis`, opens on tap.
 * Menu chrome / destructive styling come from the system.
 */
export function ItemDetailsOverflowButton({
  actions,
  accessibilityLabel = 'More options',
}: Props) {
  const { colors } = useTheme();

  return (
    <Host style={styles.host} matchContents ignoreSafeArea="all">
      <Menu
        label={<Image systemName="ellipsis" size={20} color={colors.text} />}
        modifiers={[a11yLabelModifier(accessibilityLabel)]}
      >
        {actions.map((action) => (
          <Button
            key={action.key}
            label={action.label}
            systemImage={action.systemImage as any}
            role={action.destructive ? 'destructive' : undefined}
            onPress={() => {
              // Let the system menu dismiss before presenting confirmations / navigation.
              requestAnimationFrame(() => {
                if (!action.disabled) action.onPress();
              });
            }}
          />
        ))}
      </Menu>
    </Host>
  );
}

const styles = StyleSheet.create({
  host: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
