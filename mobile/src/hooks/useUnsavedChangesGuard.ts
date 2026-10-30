import { useEffect, useRef, type MutableRefObject } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export type UnsavedChangesGuardOptions = {
  enabled?: boolean;
  title?: string;
  message?: string;
  keepLabel?: string;
  discardLabel?: string;
  /**
   * Set `true` synchronously before a successful Save/Delete navigation so
   * `beforeRemove` does not re-prompt (React state may not have flushed yet).
   */
  bypassRef?: MutableRefObject<boolean>;
};

/**
 * Blocks navigation when the editor draft is dirty and offers a native system
 * discard confirmation. Covers header Cancel (via goBack), Android back, and
 * React Navigation `beforeRemove` for supported dismissals.
 */
export function useUnsavedChangesGuard(
  isDirty: boolean,
  options: UnsavedChangesGuardOptions = {},
) {
  const navigation = useNavigation();
  const enabled = options.enabled ?? true;
  const title = options.title ?? 'Discard changes?';
  const message =
    options.message ?? 'You have unsaved edits. Discard them or keep editing?';
  const keepLabel = options.keepLabel ?? 'Keep Editing';
  const discardLabel = options.discardLabel ?? 'Discard Changes';
  const bypassRef = options.bypassRef;

  const dirtyRef = useRef(isDirty);
  dirtyRef.current = isDirty;
  const confirmingRef = useRef(false);
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
      if (!enabledRef.current) return;
      if (bypassRef?.current) return;
      if (!dirtyRef.current) return;

      // Already showing the alert — block without stacking another.
      if (confirmingRef.current) {
        e.preventDefault();
        return;
      }

      e.preventDefault();
      confirmingRef.current = true;

      Alert.alert(title, message, [
        {
          text: keepLabel,
          style: 'cancel',
          onPress: () => {
            confirmingRef.current = false;
          },
        },
        {
          text: discardLabel,
          style: 'destructive',
          onPress: () => {
            confirmingRef.current = false;
            if (bypassRef) bypassRef.current = true;
            navigation.dispatch(e.data.action);
          },
        },
      ]);
    });

    return unsubscribe;
  }, [navigation, title, message, keepLabel, discardLabel, bypassRef]);
}
