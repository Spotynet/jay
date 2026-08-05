'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.PickerContextProvider = void 0;
exports.default = usePickerContext;
var _react = require('react');
const pickerContext = /*#__PURE__*/ (0, _react.createContext)(null);
const PickerContextProvider = (exports.PickerContextProvider = pickerContext.Provider);
function usePickerContext() {
  const ctx = (0, _react.useContext)(pickerContext);
  if (!ctx) {
    throw new Error('[reanimated-color-picker]: App context is not ready yet!');
  }
  return ctx;
}
