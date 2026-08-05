'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.Panel3ContextProvider = void 0;
exports.default = usePanel3Context;
var _react = require('react');
const panel3Context = /*#__PURE__*/ (0, _react.createContext)(null);
const Panel3ContextProvider = (exports.Panel3ContextProvider = panel3Context.Provider);
function usePanel3Context() {
  const ctx = (0, _react.useContext)(panel3Context);
  if (!ctx) {
    throw new Error('[reanimated-color-picker]: App context is not ready yet!');
  }
  return ctx;
}
