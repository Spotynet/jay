'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.PreviewText = PreviewText;
var _react = _interopRequireWildcard(require('react'));
var _reactNative = require('react-native');
var _reactNativeReanimated = _interopRequireWildcard(require('react-native-reanimated'));
var _AppContext = _interopRequireDefault(require('../AppContext'));
var _styles = require('../styles');
var _utils = require('../utils');
function _interopRequireDefault(e) {
  return e && e.__esModule ? e : { default: e };
}
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
_reactNativeReanimated.default.addWhitelistedNativeProps({
  text: true,
});
const AnimatedTextInput = _reactNativeReanimated.default.createAnimatedComponent(_reactNative.TextInput);
function PreviewText({ style = {}, colorFormat = 'hex' }) {
  const { returnedResults, hueValue, saturationValue, brightnessValue, alphaValue } = (0, _AppContext.default)();
  const inputRef = (0, _reactNativeReanimated.useAnimatedRef)();
  const [defaultValue, setDefaultValue] = (0, _react.useState)('');
  (0, _react.useEffect)(() => {
    setDefaultValue(returnedResults()[colorFormat]);
  }, []);
  const colorString = (0, _reactNativeReanimated.useDerivedValue)(() => {
    // Explicitly touch dependencies so Reanimated tracks them and doesn’t prune the worklet
    (() => [colorFormat, hueValue, saturationValue, brightnessValue, alphaValue])();
    if (_utils.isWeb && inputRef.current) {
      // @ts-expect-error value doesn't exist
      inputRef.current.value = returnedResults()[colorFormat];
      return;
    }
    return returnedResults()[colorFormat];
  }, [colorFormat, hueValue, saturationValue, brightnessValue, alphaValue]);
  const animatedProps = (0, _reactNativeReanimated.useAnimatedProps)(
    () => ({
      text: colorString.value,
    }),
    [colorString],
  );
  return /*#__PURE__*/ _react.default.createElement(AnimatedTextInput, {
    ref: inputRef,
    underlineColorAndroid: 'transparent',
    editable: false,
    defaultValue: defaultValue,
    style: [_styles.styles.previewText, style],
    animatedProps: animatedProps,
    pointerEvents: _utils.isWeb ? undefined : 'none',
  });
}
