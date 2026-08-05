'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.default = HwbWidget;
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
function HwbWidget({
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
  const hwb = (0, _react.useRef)(_index.default.HWB(returnedResults().hwba).object(false));
  const h = (0, _reactNativeReanimated.useSharedValue)(hwb.current.h.toString());
  const w = (0, _reactNativeReanimated.useSharedValue)(hwb.current.w.toString());
  const b = (0, _reactNativeReanimated.useSharedValue)(hwb.current.b.toString());
  const a = (0, _reactNativeReanimated.useSharedValue)(hwb.current.a.toString());
  (0, _reactNativeReanimated.useDerivedValue)(() => {
    [hueValue, saturationValue, brightnessValue, alphaValue]; // track changes on Native
    hwb.current = _index.default.runOnUI().HWB(returnedResults().hwba).object(false);
    h.value = hwb.current.h.toString();
    w.value = hwb.current.w.toString();
    b.value = hwb.current.b.toString();
    a.value = hwb.current.a.toString();
  }, [hueValue, saturationValue, brightnessValue, alphaValue, h, w, b, a]); // track changes on WEB

  const onHueEndEditing = text => {
    const hue = (0, _utils.clamp)(+text, 360);
    h.value = ''; // force update in case the value of `h` didn't change
    onChange({
      h: hue,
      w: +w.value,
      b: +b.value,
      a: +a.value,
    });
  };
  const onWhiteEndEditing = text => {
    const whiteness = (0, _utils.clamp)(+text, 100);
    w.value = ''; // force update in case the value of `w` didn't change
    onChange({
      h: +h.value,
      w: whiteness,
      b: +b.value,
      a: +a.value,
    });
  };
  const onBlackEndEditing = text => {
    const blackness = (0, _utils.clamp)(+text, 100);
    b.value = ''; // force update in case the value of `b` didn't change
    onChange({
      h: +h.value,
      w: +w.value,
      b: blackness,
      a: +a.value,
    });
  };
  const onAlphaEndEditing = text => {
    const alpha = (0, _utils.clamp)(+text, 1);
    a.value = ''; // force update in case the value of `a` didn't change
    onChange({
      h: +h.value,
      w: +w.value,
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
      textValue: h,
      title: 'H',
      onEndEditing: onHueEndEditing,
      inputProps: inputProps,
    }),
    /*#__PURE__*/ _react.default.createElement(_WidgetTextInput.default, {
      inputStyle: inputStyle,
      textStyle: inputTitleStyle,
      textValue: w,
      title: 'W',
      onEndEditing: onWhiteEndEditing,
      inputProps: inputProps,
    }),
    /*#__PURE__*/ _react.default.createElement(_WidgetTextInput.default, {
      inputStyle: inputStyle,
      textStyle: inputTitleStyle,
      textValue: b,
      title: 'B',
      onEndEditing: onBlackEndEditing,
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
