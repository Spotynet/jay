'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.ConditionalRendering = ConditionalRendering;
exports.HSVA2HSLA_string = void 0;
exports.RenderNativeOnly = RenderNativeOnly;
exports.RenderWebOnly = RenderWebOnly;
exports.enableAndroidHardwareTextures = exports.clamp = void 0;
exports.getStyle = getStyle;
exports.isWeb = exports.isRtl = void 0;
var _react = _interopRequireDefault(require('react'));
var _reactNative = require('react-native');
function _interopRequireDefault(e) {
  return e && e.__esModule ? e : { default: e };
}
const isRtl = (exports.isRtl = _reactNative.I18nManager.isRTL);
const isWeb = (exports.isWeb = _reactNative.Platform.OS === 'web');

/** - Get a specific property from a react native style object */
function getStyle(style, property) {
  const flattened = _reactNative.StyleSheet.flatten(style);
  return flattened[property];
}

/** - Clamp a number value between `0` and a max value */
const clamp = (v, max) => {
  'worklet';

  return Math.min(Math.max(v, 0), max);
};

/** - Convert `HSV` color to an `HSLA` string representation */
exports.clamp = clamp;
const HSVA2HSLA_string = (h, s, v, a = 1) => {
  'worklet';

  s = s / 100;
  v = v / 100;
  const l = ((2 - s) * v) / 2,
    sl = s * v,
    sln = l !== 0 && l !== 1 ? sl / (l < 0.5 ? l * 2 : 2 - l * 2) : sl;
  return `hsla(${h}, ${sln * 100}%, ${l * 100}%, ${a})`;
};

/** - Render children only if the `render` property is `true` */
exports.HSVA2HSLA_string = HSVA2HSLA_string;
function ConditionalRendering(props) {
  if (!props.if) return null;
  return /*#__PURE__*/ _react.default.createElement(_react.default.Fragment, null, props.children);
}

/** - Render children for native platforms only (Android, IOS) */
function RenderNativeOnly({ children }) {
  if (isWeb) return null;
  return /*#__PURE__*/ _react.default.createElement(_react.default.Fragment, null, children);
}

/** - Render children for Web platform only */
function RenderWebOnly({ children }) {
  if (!isWeb) return null;
  return /*#__PURE__*/ _react.default.createElement(_react.default.Fragment, null, children);
}

/**
 * Enable Android hardware texture rendering for Android Nougat(API 24) to Pie(API 28) to address an issue when applying a
 * transform on a View with a border radius > 0.
 *
 * See: https://github.com/facebook/react-native/issues/18266
 */
const enableAndroidHardwareTextures = (exports.enableAndroidHardwareTextures =
  _reactNative.Platform.OS === 'android' && _reactNative.Platform.Version >= 24 && _reactNative.Platform.Version <= 28);
