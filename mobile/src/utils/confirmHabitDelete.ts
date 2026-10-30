import { Alert } from 'react-native';
import { habitDeleteAlertMessage } from './habitDeleteCopy';

export { habitDeleteAlertMessage } from './habitDeleteCopy';

/**
 * Native confirmation before deleting a habit definition.
 * Presentation only — callers own the delete mutation.
 */
export function confirmHabitDelete(habitName: string, onConfirm: () => void): void {
  Alert.alert('Delete habit?', habitDeleteAlertMessage(habitName), [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Delete Habit',
      style: 'destructive',
      onPress: onConfirm,
    },
  ]);
}
