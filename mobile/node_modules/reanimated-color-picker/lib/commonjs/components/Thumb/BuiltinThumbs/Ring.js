'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.default = Ring;
var _react = _interopRequireDefault(require('react'));
var _reactNativeReanimated = _interopRequireWildcard(require('react-native-reanimated'));
var _index = _interopRequireDefault(require('../../../colorKit/index'));
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
function Ring({ width, height, borderRadius, adaptiveColor, handleStyle, innerStyle, solidColor, style }) {
  const ringStyle = {
    width,
    height,
    borderRadius,
    borderWidth: 1,
  };
  const borderColor = (0, _utils.getStyle)(style, 'borderColor');
  const ringBackgroundColor = (0, _utils.getStyle)(style, 'backgroundColor');
  const adaptiveColorStyle = (0, _reactNativeReanimated.useAnimatedStyle)(() => {
    return {
      backgroundColor: ringBackgroundColor ?? _index.default.runOnUI().setAlpha(adaptiveColor.value, 0.5).hex(),
      borderColor: borderColor ?? adaptiveColor.value,
    };
  }, [adaptiveColor]);

  // Make sure to match the parity (odd or even) of the parent width, to solve the centering issue
  const innerWidth = 0.75 * width;
  const innerSize = width % 2 === 0 ? Math.floor(innerWidth / 2) * 2 : Math.floor(innerWidth / 2) * 2 + 1;
  return /*#__PURE__*/ _react.default.createElement(
    _reactNativeReanimated.default.View,
    {
      style: [_styles.styles.handle, ringStyle, adaptiveColorStyle, style, handleStyle],
      renderToHardwareTextureAndroid: _utils.enableAndroidHardwareTextures,
    },
    /*#__PURE__*/ _react.default.createElement(_reactNativeReanimated.default.View, {
      style: [
        _styles.styles.shadow,
        {
          borderRadius,
          zIndex: 100,
          width: innerSize,
          height: innerSize,
        },
        solidColor,
        innerStyle,
      ],
    }),
  );
}
