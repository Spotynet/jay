'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.default = HslWidget;
var _react = _interopRequireWildcard(require('react'));
var _reactNativeReanimated = require('react-native-reanimated');
var _index = _interopRequireDefault(require('../../../colorKit/index'));
var _utils = require('../../../utils');
var _WidgetTextInput = _interopRequireDefault(require('./WidgetTextInput'));
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
function HslWidget({
  onChange,
  returnedResults,
  hueValue,
  saturationValue,
  brightnessValue,
  alphaValue,
  inputStyle,
  inputTitleStyle,
  inputProps,
  disableAlphaChannel,
}) {
  const hsl = (0, _react.useRef)(_index.default.HSL(returnedResults().hsla).object(false));
  const h = (0, _reactNativeReanimated.useSharedValue)(hsl.current.h.toString());
  const s = (0, _reactNativeReanimated.useSharedValue)(hsl.current.s.toString());
  const l = (0, _reactNativeReanimated.useSharedValue)(hsl.current.l.toString());
  const a = (0, _reactNativeReanimated.useSharedValue)(hsl.current.a.toString());
  (0, _reactNativeReanimated.useDerivedValue)(() => {
    [hueValue, saturationValue, brightnessValue, alphaValue]; // track changes on Native
    hsl.current = _index.default.runOnUI().HSL(returnedResults().hsla).object(false);
    h.value = hsl.current.h.toString();
    s.value = hsl.current.s.toString();
    l.value = hsl.current.l.toString();
    a.value = hsl.current.a.toString();
  }, [hueValue, saturationValue, brightnessValue, alphaValue, h, s, l, a]); // track changes on WEB

  const onHueEndEditing = text => {
    const hue = (0, _utils.clamp)(+text, 360);
    h.value = ''; // force update in case the value of h didn't change
    onChange({
      h: hue,
      s: +s.value,
      l: +l.value,
      a: +a.value,
    });
  };
  const onSaturationEndEditing = text => {
    const saturation = (0, _utils.clamp)(+text, 100);
    s.value = ''; // force update in case the value of `s` didn't change
    onChange({
      h: +h.value,
      s: saturation,
      l: +l.value,
      a: +a.value,
    });
  };
  const onLumEndEditing = text => {
    const lum = (0, _utils.clamp)(+text, 100);
    l.value = ''; // force update in case the value of `l` didn't change
    onChange({
      h: +h.value,
      s: +s.value,
      l: lum,
      a: +a.value,
    });
  };
  const onAlphaEndEditing = text => {
    const alpha = (0, _utils.clamp)(+text, 1);
    a.value = ''; // force update in case the value of `a` didn't change
    onChange({
      h: +h.value,
      s: +s.value,
      l: +l.value,
      a: alpha,
    });
  };
  return /*#__PURE__*/ _react.default.createElement(
    _react.default.Fragment,
    null,
    /*#__PURE__*/ _react.default.createElement(_WidgetTextInput.default, {
      inputStyle: inputStyle,
      textStyle: inputTitleStyle,
      textValue: h,
      title: 'H',
      onEndEditing: onHueEndEditing,
      inputProps: inputProps,
    }),
    /*#__PURE__*/ _react.default.createElement(_WidgetTextInput.default, {
      inputStyle: inputStyle,
      textStyle: inputTitleStyle,
      textValue: s,
      title: 'S',
      onEndEditing: onSaturationEndEditing,
      inputProps: inputProps,
    }),
    /*#__PURE__*/ _react.default.createElement(_WidgetTextInput.default, {
      inputStyle: inputStyle,
      textStyle: inputTitleStyle,
      textValue: l,
      title: 'L',
      onEndEditing: onLumEndEditing,
      inputProps: inputProps,
    }),
    /*#__PURE__*/ _react.default.createElement(
      _utils.ConditionalRendering,
      {
        if: !disableAlphaChannel,
      },
      /*#__PURE__*/ _react.default.createElement(_WidgetTextInput.default, {
        inputStyle: inputStyle,
        textStyle: inputTitleStyle,
        textValue: a,
        title: 'A',
        onEndEditing: onAlphaEndEditing,
        inputProps: inputProps,
        decimal: true,
      }),
    ),
  );
}
