'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.default = WidgetTextInput;
var _react = _interopRequireWildcard(require('react'));
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
function _extends() {
  return (
    (_extends = Object.assign
      ? Object.assign.bind()
      : function (n) {
          for (var e = 1; e < arguments.length; e++) {
            var t = arguments[e];
            for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
          }
          return n;
        }),
    _extends.apply(null, arguments)
  );
}
_reactNativeReanimated.default.addWhitelistedNativeProps({
  text: true,
});
const AnimatedTextInput = _reactNativeReanimated.default.createAnimatedComponent(_reactNative.TextInput);
function WidgetTextInput({
  textValue,
  decimal = false,
  textKeyboard = false,
  title,
  inputStyle,
  textStyle,
  inputProps,
  onEndEditing,
}) {
  const inputRef = (0, _reactNativeReanimated.useAnimatedRef)();
  const animatedProps = (0, _reactNativeReanimated.useAnimatedProps)(
    () => ({
      text: textValue.value,
    }),
    [textValue],
  );
  const submit = e => {
    const text = e.nativeEvent.text;

    // number input mode
    if (decimal || !textKeyboard) {
      const num = parseFloat(text);
      if (typeof num !== 'number' || isNaN(num) || !isFinite(num)) {
        textValue.value = ''; // reset input
        return;
      }
    }
    onEndEditing(text);
  };
  (0, _react.useEffect)(() => {
    const hideSubscription = _reactNative.Keyboard.addListener('keyboardDidHide', () => {
      if (!inputRef.current) return;
      inputRef.current.blur();
    });
    return () => hideSubscription.remove();
  }, []);

  // For web platform only
  (0, _reactNativeReanimated.useDerivedValue)(() => {
    if (!_utils.isWeb || !inputRef.current) return;

    // @ts-expect-error value doesn't exist
    inputRef.current.value = textValue.value;
  }, [textValue]);
  return /*#__PURE__*/ _react.default.createElement(
    _reactNative.View,
    {
      style: _styles.styles.inputsContainer,
    },
    /*#__PURE__*/ _react.default.createElement(
      AnimatedTextInput,
      _extends(
        {
          ref: inputRef,
          style: [_styles.styles.input, inputStyle],
          defaultValue: textValue.value,
          maxLength: decimal ? 4 : textKeyboard ? 9 : 3, // length example: Alpha (1.55), RGB (255), Hue (360), Brightness (100), hex (#00000000)
          onEndEditing: submit,
          onBlur: _utils.isWeb ? submit : undefined,
          enterKeyHint: 'enter',
          returnKeyType: 'done',
          keyboardType: decimal ? 'decimal-pad' : textKeyboard ? 'default' : 'number-pad',
          inputMode: decimal ? 'decimal' : textKeyboard ? 'text' : 'numeric',
          autoComplete: 'off',
          autoCorrect: false,
          autoFocus: false,
        },
        inputProps,
        {
          selectTextOnFocus: !textKeyboard,
          animatedProps: animatedProps,
        },
      ),
    ),
    /*#__PURE__*/ _react.default.createElement(
      _reactNative.Text,
      {
        style: [_styles.styles.inputTitle, textStyle],
      },
      title,
    ),
  );
}
