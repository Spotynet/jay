import React from 'react';
import { View, StyleSheet } from 'react-native';
import { IconTrash } from 'tabler-icons-react-native';
import { Icon } from '../../../components/ui/Icon';

type Props = { color: string };

/**
 * Trash glyph for the Habit edit destructive row.
 *
 * Intentionally plain RN — `@expo/ui` SwiftUI `Host` as a Pressable child
 * previously ignored the parent row’s `flexDirection` and stacked the icon
 * above the label. SF Symbol Host is not used here for that reason.
 */
export function HabitDeleteRowIcon({ color }: Props) {
  return (
    <View style={styles.box} pointerEvents="none" collapsable={false}>
      <Icon name={IconTrash} size={18} color={color} stroke={1.8} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});
