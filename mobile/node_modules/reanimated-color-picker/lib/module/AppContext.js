import { createContext, useContext } from 'react';
const pickerContext = /*#__PURE__*/ createContext(null);
export const PickerContextProvider = pickerContext.Provider;
export default function usePickerContext() {
  const ctx = useContext(pickerContext);
  if (!ctx) {
    throw new Error('[reanimated-color-picker]: App context is not ready yet!');
  }
  return ctx;
}
