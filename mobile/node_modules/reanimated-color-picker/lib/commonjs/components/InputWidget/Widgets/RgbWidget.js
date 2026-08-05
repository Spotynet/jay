'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.default = RgbWidget;
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
function RgbWidget({
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
  const rgb = (0, _react.useRef)(_index.default.RGB(returnedResults().rgba).object(false));
  const r = (0, _reactNativeReanimated.useSharedValue)(rgb.current.r.toString());
  const g = (0, _reactNativeReanimated.useSharedValue)(rgb.current.g.toString());
  const b = (0, _reactNativeReanimated.useSharedValue)(rgb.current.b.toString());
  const a = (0, _reactNativeReanimated.useSharedValue)(rgb.current.a.toString());
  (0, _reactNativeReanimated.useDerivedValue)(() => {
    [hueValue, saturationValue, brightnessValue, alphaValue]; // track changes on Native
    rgb.current = _index.default.runOnUI().RGB(returnedResults().rgba).object(false);
    r.value = rgb.current.r.toString();
    g.value = rgb.current.g.toString();
    b.value = rgb.current.b.toString();
    a.value = rgb.current.a.toString();
  }, [hueValue, saturationValue, brightnessValue, alphaValue]); // track changes on WEB

  const onRedEndEditing = text => {
    const red = (0, _utils.clamp)(+text, 255);
    r.value = ''; // force update in case the value of `r` didn't change
    onChange({
      r: red,
      g: +g.value,
      b: +b.value,
      a: +a.value,
    });
  };
  const onGreenEndEditing = text => {
    const green = (0, _utils.clamp)(+text, 255);
    g.value = ''; // force update in case the value of `g` didn't change
    onChange({
      r: +r.value,
      g: green,
      b: +b.value,
      a: +a.value,
    });
  };
  const onBlueEndEditing = text => {
    const blue = (0, _utils.clamp)(+text, 255);
    b.value = ''; // force update in case the value of `b` didn't change
    onChange({
      r: +r.value,
      g: +g.value,
      b: blue,
      a: +a.value,
    });
  };
  const onAlphaEndEditing = text => {
    const alpha = (0, _utils.clamp)(parseFloat(text), 1);
    a.value = ''; // force update in case the value of `a` didn't change
    onChange({
      r: +r.value,
      g: +g.value,
      b: +b.value,
      a: alpha,
    });
  };
  return /*#__PURE__*/ _react.default.createElement(
    _react.default.Fragment,
    null,
    /*#__PURE__*/ _react.default.createElement(_WidgetTextInput.default, {
      inputStyle: inputStyle,
      textStyle: inputTitleStyle,
      textValue: r,
      title: 'R',
      onEndEditing: onRedEndEditing,
      inputProps: inputProps,
    }),
    /*#__PURE__*/ _react.default.createElement(_WidgetTextInput.default, {
      inputStyle: inputStyle,
      textStyle: inputTitleStyle,
      textValue: g,
      title: 'G',
      onEndEditing: onGreenEndEditing,
      inputProps: inputProps,
    }),
    /*#__PURE__*/ _react.default.createElement(_WidgetTextInput.default, {
      inputStyle: inputStyle,
      textStyle: inputTitleStyle,
      textValue: b,
      title: 'B',
      onEndEditing: onBlueEndEditing,
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
