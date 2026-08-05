'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.InputWidget = InputWidget;
var _react = _interopRequireWildcard(require('react'));
var _reactNative = require('react-native');
var _index = _interopRequireDefault(require('../../colorKit/index'));
var _AppContext = _interopRequireDefault(require('../../AppContext'));
var _styles = require('../../styles');
var _utils = require('../../utils');
var _HexWidget = _interopRequireDefault(require('./Widgets/HexWidget'));
var _HslWidget = _interopRequireDefault(require('./Widgets/HslWidget'));
var _HsvWidget = _interopRequireDefault(require('./Widgets/HsvWidget'));
var _HwbWidget = _interopRequireDefault(require('./Widgets/HwbWidget'));
var _RgbWidget = _interopRequireDefault(require('./Widgets/RgbWidget'));
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
const defaultFormats = ['HEX', 'RGB', 'HSL', 'HWB', 'HSV'];
function InputWidget({
  defaultFormat = 'HEX',
  formats = defaultFormats,
  iconColor = 'black',
  disableAlphaChannel = false,
  containerStyle = {},
  inputStyle = {},
  inputTitleStyle = {},
  iconStyle = {},
  inputProps = {},
}) {
  const { setColor, returnedResults, hueValue, saturationValue, brightnessValue, alphaValue, onGestureChange, onGestureEnd } = (0,
  _AppContext.default)();
  const [format, setFormat] = (0, _react.useState)(formats.includes(defaultFormat) ? defaultFormat : formats[0] ?? 'HEX');
  const onChange = color => {
    var _colorKit$getFormat;
    const isHex =
      (_colorKit$getFormat = _index.default.getFormat(color)) === null || _colorKit$getFormat === void 0
        ? void 0
        : _colorKit$getFormat.includes('hex');
    if (disableAlphaChannel && isHex) color = _index.default.setAlpha(color, 1).hsv().object(false);
    setColor(color, 0);
    onGestureChange(color);
    onGestureEnd(color);
  };
  const cycle = () => {
    const index = formats.indexOf(format);
    const nextIndex = (index + 1) % formats.length;
    setFormat(formats[nextIndex]);
  };
  const inputsProps = {
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
  };
  const Input = () => {
    switch (format) {
      case 'HEX':
        return /*#__PURE__*/ _react.default.createElement(_HexWidget.default, inputsProps);
      case 'RGB':
        return /*#__PURE__*/ _react.default.createElement(_RgbWidget.default, inputsProps);
      case 'HSL':
        return /*#__PURE__*/ _react.default.createElement(_HslWidget.default, inputsProps);
      case 'HWB':
        return /*#__PURE__*/ _react.default.createElement(_HwbWidget.default, inputsProps);
      case 'HSV':
        return /*#__PURE__*/ _react.default.createElement(_HsvWidget.default, inputsProps);
    }
  };
  const gap = (0, _utils.getStyle)(containerStyle, 'gap') ?? 5;
  const iconWidth = (0, _utils.getStyle)(iconStyle, 'width') ?? 24;
  const buttonIconStyle = _reactNative.StyleSheet.flatten([_styles.styles.arrowButton, iconStyle]);
  return /*#__PURE__*/ _react.default.createElement(
    _reactNative.View,
    {
      style: [_styles.styles.container, containerStyle],
    },
    /*#__PURE__*/ _react.default.createElement(
      _reactNative.View,
      {
        style: [
          _styles.styles.inputsWrapper,
          {
            gap,
          },
        ],
      },
      /*#__PURE__*/ _react.default.createElement(Input, null),
    ),
    /*#__PURE__*/ _react.default.createElement(
      _utils.ConditionalRendering,
      {
        if: formats.length > 1,
      },
      /*#__PURE__*/ _react.default.createElement(
        _reactNative.View,
        {
          style: {
            width: iconWidth,
          },
        },
        /*#__PURE__*/ _react.default.createElement(
          _reactNative.Pressable,
          {
            onPress: cycle,
          },
          /*#__PURE__*/ _react.default.createElement(_reactNative.Image, {
            style: buttonIconStyle,
            tintColor: iconColor,
            source: require('../../assets/arrow-icon.png'),
          }),
        ),
        /*#__PURE__*/ _react.default.createElement(
          _reactNative.Text,
          {
            style: _styles.styles.inputTitle,
          },
          ' ',
        ),
      ),
    ),
  );
}
