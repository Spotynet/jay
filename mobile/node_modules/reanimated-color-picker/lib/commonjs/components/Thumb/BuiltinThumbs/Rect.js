'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.default = Rect;
var _react = _interopRequireDefault(require('react'));
var _reactNativeReanimated = _interopRequireWildcard(require('react-native-reanimated'));
var _styles = require('../../../styles');
var _utils = require('../../../utils');
function _getRequireWildcardCache(e) {
  if ('function' != typeof WeakMap) return null;
  var r = new WeakMap(),
    t = new WeakMap();
  return (_getRequireWildcardCache = function (e) {
    return e ? t : r;
  })(e);
}
function _interopRequireWildcard(e, r) {
  if (!r && e && e.__esModule) return e;
  if (null === e || ('object' != typeof e && 'function' != typeof e)) return { default: e };
  var t = _getRequireWildcardCache(r);
  if (t && t.has(e)) return t.get(e);
  var n = { __proto__: null },
    a = Object.defineProperty && Object.getOwnPropertyDescriptor;
  for (var u in e)
    if ('default' !== u && {}.hasOwnProperty.call(e, u)) {
      var i = a ? Object.getOwnPropertyDescriptor(e, u) : null;
      i && (i.get || i.set) ? Object.defineProperty(n, u, i) : (n[u] = e[u]);
    }
  return (n.default = e), t && t.set(e, n), n;
}
function _interopRequireDefault(e) {
  return e && e.__esModule ? e : { default: e };
}
function Rect({ width, height, adaptiveColor, handleStyle, innerStyle, style, vertical, solidColor }) {
  const computedStyle = {
    width,
    height,
  };
  const pillStyle = {
    borderWidth: 1,
    width: vertical ? '100%' : 14,
    height: vertical ? 14 : '100%',
  };
  const borderColor = (0, _utils.getStyle)(innerStyle, 'borderColor');
  const adaptiveColorStyle = (0, _reactNativeReanimated.useAnimatedStyle)(
    () => ({
      borderColor: borderColor ?? adaptiveColor.value,
    }),
    [adaptiveColor],
  );
  return /*#__PURE__*/ _react.default.createElement(
    _reactNativeReanimated.default.View,
    {
      style: [_styles.styles.handle, style, computedStyle, handleStyle],
      renderToHardwareTextureAndroid: _utils.enableAndroidHardwareTextures,
    },
    /*#__PURE__*/ _react.default.createElement(_reactNativeReanimated.default.View, {
      style: [pillStyle, _styles.styles.shadow, adaptiveColorStyle, solidColor, innerStyle],
    }),
  );
}
