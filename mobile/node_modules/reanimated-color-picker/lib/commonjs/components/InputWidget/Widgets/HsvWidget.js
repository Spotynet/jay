'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.default = HsvWidget;
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
function HsvWidget({
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
  const hsv = (0, _react.useRef)(_index.default.HSV(returnedResults().hsva).object(false));
  const h = (0, _reactNativeReanimated.useSharedValue)(hsv.current.h.toString());
  const s = (0, _reactNativeReanimated.useSharedValue)(hsv.current.s.toString());
  const v = (0, _reactNativeReanimated.useSharedValue)(hsv.current.v.toString());
  const a = (0, _reactNativeReanimated.useSharedValue)(hsv.current.a.toString());
  (0, _reactNativeReanimated.useDerivedValue)(() => {
    [hueValue, saturationValue, brightnessValue, alphaValue]; // track changes on Native
    hsv.current = _index.default.runOnUI().HSV(returnedResults().hsva).object(false);
    h.value = hsv.current.h.toString();
    s.value = hsv.current.s.toString();
    v.value = hsv.current.v.toString();
    a.value = hsv.current.a.toString();
  }, [hueValue, saturationValue, brightnessValue, alphaValue, h, s, v, a]); // track changes on WEB

  const onHueEndEditing = text => {
    const hue = (0, _utils.clamp)(+text, 360);
    h.value = ''; // force update in case the value of `h` didn't change
    onChange({
      h: hue,
      s: +s.value,
      v: +v.value,
      a: +a.value,
    });
  };
  const onSaturationEndEditing = text => {
    const saturation = (0, _utils.clamp)(+text, 100);
    s.value = ''; // force update in case the value of `s` didn't change
    onChange({
      h: +h.value,
      s: saturation,
      v: +v.value,
      a: +a.value,
    });
  };
  const onValueEndEditing = text => {
    const value = (0, _utils.clamp)(+text, 100);
    v.value = ''; // force update in case the value of `v` didn't change
    onChange({
      h: +h.value,
      s: +s.value,
      v: value,
      a: +a.value,
    });
  };
  const onAlphaEndEditing = text => {
    const alpha = (0, _utils.clamp)(+text, 1);
    a.value = ''; // force update in case the value of `a` didn't change
    onChange({
      h: +h.value,
      s: +s.value,
      v: +v.value,
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
      textValue: v,
      title: 'V',
      onEndEditing: onValueEndEditing,
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
