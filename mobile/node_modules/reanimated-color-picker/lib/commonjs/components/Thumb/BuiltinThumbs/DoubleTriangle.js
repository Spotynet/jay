'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.default = DoubleTriangle;
var _react = _interopRequireDefault(require('react'));
var _reactNative = require('react-native');
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
function DoubleTriangle({ width, height, thumbColor, adaptiveColor, handleStyle, innerStyle, style, vertical }) {
  const computedStyle = {
    width,
    height,
    flexDirection: vertical ? (_utils.isRtl ? 'row' : 'row-reverse') : 'column',
  };
  const triangleUpStyle = {
    borderBottomWidth: 10,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    transform: [
      {
        rotate: vertical ? '90deg' : '0deg',
      },
    ],
  };
  const triangleDownStyle = {
    borderBottomWidth: 10,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    transform: [
      {
        rotate: vertical ? '270deg' : '180deg',
      },
    ],
  };
  const adaptiveColorStyle = (0, _reactNativeReanimated.useAnimatedStyle)(() => {
    return {
      borderBottomColor: thumbColor ?? adaptiveColor.value,
    };
  }, [adaptiveColor]);
  return /*#__PURE__*/ _react.default.createElement(
    _reactNativeReanimated.default.View,
    {
      style: [_styles.styles.handle, style, computedStyle, handleStyle],
      renderToHardwareTextureAndroid: _utils.enableAndroidHardwareTextures,
    },
    /*#__PURE__*/ _react.default.createElement(_reactNativeReanimated.default.View, {
      style: [_styles.styles.triangle, triangleDownStyle, adaptiveColorStyle, innerStyle],
    }),
    /*#__PURE__*/ _react.default.createElement(_reactNative.View, {
      style: {
        width: '50%',
        height: '50%',
      },
    }),
    /*#__PURE__*/ _react.default.createElement(_reactNativeReanimated.default.View, {
      style: [_styles.styles.triangle, triangleUpStyle, adaptiveColorStyle, innerStyle],
    }),
  );
}
