'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.default = HexWidget;
var _react = _interopRequireDefault(require('react'));
var _reactNativeReanimated = require('react-native-reanimated');
var _index = _interopRequireDefault(require('../../../colorKit/index'));
var _WidgetTextInput = _interopRequireDefault(require('./WidgetTextInput'));
function _interopRequireDefault(e) {
  return e && e.__esModule ? e : { default: e };
}
function HexWidget({
  onChange,
  returnedResults,
  hueValue,
  saturationValue,
  brightnessValue,
  alphaValue,
  inputStyle,
  inputTitleStyle,
  inputProps,
}) {
  const hexColor = (0, _reactNativeReanimated.useSharedValue)(returnedResults().hex);
  (0, _reactNativeReanimated.useDerivedValue)(() => {
    [hueValue, saturationValue, brightnessValue, alphaValue]; // track changes on Native
    hexColor.value = returnedResults().hex;
  }, [hueValue, saturationValue, brightnessValue, alphaValue]); // track changes on WEB

  const onEndEditing = text => {
    var _colorKit$getFormat;
    text = text.startsWith('#') ? text : '#' + text;
    const isHex =
      (_colorKit$getFormat = _index.default.getFormat(text)) === null || _colorKit$getFormat === void 0
        ? void 0
        : _colorKit$getFormat.includes('hex');
    hexColor.value = ''; // force update in case the value of `hexColor` didn't change
    if (isHex) {
      onChange(text);
      return;
    }
  };
  return /*#__PURE__*/ _react.default.createElement(_WidgetTextInput.default, {
    inputStyle: inputStyle,
    textStyle: inputTitleStyle,
    textValue: hexColor,
    title: 'HEX',
    onEndEditing: onEndEditing,
    inputProps: inputProps,
    textKeyboard: true,
  });
}
