import { useEffect } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

/**
 * Blocks navigation when the editor draft is dirty and offers Discard / Keep editing.
 * Covers header back, Android back, and browser back via React Navigation.
 */
export function useUnsavedChangesGuard(isDirty: boolean, options?: { enabled?: boolean }) {
  const navigation = useNavigation();
  const enabled = options?.enabled ?? true;

  useEffect(() => {
    if (!enabled) return;

    const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
      if (!isDirty) return;

      e.preventDefault();

      Alert.alert(
        'Discard changes?',
        'You have unsaved edits. Discard them or keep editing?',
        [
          { text: 'Keep editing', style: 'cancel', onPress: () => {} },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => navigation.dispatch(e.data.action),
          },
        ],
      );
    });

    return unsubscribe;
  }, [navigation, isDirty, enabled]);
}
