import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconDots } from 'tabler-icons-react-native';
import { ActionButton } from '../common/ActionButton';
import { ItemOverflowMenu } from './ItemOverflowMenu';
import type { DetailsOverflowAction } from './detailsOverflowTypes';

type Props = {
  actions: DetailsOverflowAction[];
  accessibilityLabel?: string;
};

/**
 * Web / fallback More control.
 * `@expo/ui` MenuView does not execute actions on web — keep the existing
 * custom overflow sheet rather than a dead native stub.
 */
export function ItemDetailsOverflowButton({
  actions,
  accessibilityLabel = 'More options',
}: Props) {
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.wrap}>
      <ActionButton
        icon={IconDots}
        onPress={() => setOpen(true)}
        size={40}
        variant="plain"
        accessibilityLabel={accessibilityLabel}
      />
      <ItemOverflowMenu
        visible={open}
        onClose={() => setOpen(false)}
        anchor={{ top: insets.top + 52, right: 16 }}
        actions={actions.map((a) => ({
          key: a.key,
          label: a.label,
          destructive: a.destructive,
          onPress: a.onPress,
        }))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
