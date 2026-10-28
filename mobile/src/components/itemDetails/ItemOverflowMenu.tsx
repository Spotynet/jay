import React from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { AppText } from '../ui/AppText';

export type OverflowAction = {
  key: string;
  label: string;
  destructive?: boolean;
  onPress: () => void;
};

interface ItemOverflowMenuProps {
  visible: boolean;
  onClose: () => void;
  actions: OverflowAction[];
  /** Approximate anchor for desktop placement (top-right). */
  anchor?: { top: number; right: number };
  itemTitle?: string;
}

/**
 * Lightweight overflow menu: anchored panel on wide web, bottom sheet on phones.
 */
export function ItemOverflowMenu({
  visible,
  onClose,
  actions,
  anchor,
  itemTitle,
}: ItemOverflowMenuProps) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const anchored = Platform.OS === 'web' && width >= 720;

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={styles.overlay}
        onPress={onClose}
        accessibilityLabel="Dismiss menu"
      >
        <View
          style={[
            anchored ? styles.anchoredMenu : styles.sheetMenu,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              ...(anchored
                ? {
                    top: Math.max(insets.top + 8, anchor?.top ?? 56),
                    right: Math.max(16, anchor?.right ?? 20),
                  }
                : { paddingBottom: Math.max(insets.bottom, 20) }),
            },
          ]}
          // Prevent press bubbling to overlay
          onStartShouldSetResponder={() => true}
          accessibilityRole="menu"
          accessibilityLabel={itemTitle ? `Options for ${itemTitle}` : 'Item options'}
        >
          {!anchored ? (
            <View style={[styles.grabber, { backgroundColor: colors.border }]} />
          ) : null}
          {actions.map((action, index) => (
            <TouchableOpacity
              key={action.key}
              style={[
                styles.action,
                index < actions.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: colors.border,
                },
              ]}
              onPress={() => {
                onClose();
                // Close menu first, then run action on next tick.
                requestAnimationFrame(() => action.onPress());
              }}
              accessibilityRole="menuitem"
              accessibilityLabel={action.label}
            >
              <AppText
                style={[
                  styles.actionLabel,
                  { color: action.destructive ? colors.error : colors.text },
                ]}
              >
                {action.label}
              </AppText>
            </TouchableOpacity>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  anchoredMenu: {
    position: 'absolute',
    minWidth: 180,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  sheetMenu: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
  },
  grabber: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 6,
  },
  action: {
    minHeight: 48,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
});
