import React, { useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  CalendarPickerContent,
  startOfLocalDay,
} from '../../components/common/CalendarPickerContent';

export type CalendarPickerParams = {
  /** Epoch ms for the currently selected local calendar day. */
  selectedDateMs: number;
  /** Called with epoch ms of the committed local day. */
  onPicked?: (ms: number) => void;
  /** Called when the sheet is dismissed without a new selection. */
  onDismiss?: () => void;
};

/**
 * Content-fitting native form sheet for the Today / Journal day picker.
 * Sized via `sheetAllowedDetents: 'fitToContents'` on the stack screen options.
 */
export default function CalendarPickerScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const params = (route.params || {}) as CalendarPickerParams;
  const settledRef = useRef(false);

  const selectedDate = startOfLocalDay(
    new Date(
      typeof params.selectedDateMs === 'number' && !Number.isNaN(params.selectedDateMs)
        ? params.selectedDateMs
        : Date.now(),
    ),
  );

  const finish = useCallback(
    (pickedMs?: number) => {
      if (settledRef.current) return;
      settledRef.current = true;
      if (typeof pickedMs === 'number') {
        params.onPicked?.(pickedMs);
      } else {
        params.onDismiss?.();
      }
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    },
    [navigation, params],
  );

  // Interactive sheet dismiss / back without selecting.
  useEffect(() => {
    const unsub = navigation.addListener('beforeRemove', () => {
      if (!settledRef.current) {
        settledRef.current = true;
        params.onDismiss?.();
      }
    });
    return unsub;
  }, [navigation, params]);

  return (
    <View style={styles.host} collapsable={false}>
      <CalendarPickerContent
        selectedDate={selectedDate}
        onSelect={(date) => finish(startOfLocalDay(date).getTime())}
        onClose={() => finish()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    // Intrinsic height for fitToContents — never flex:1.
    width: '100%',
  },
});
