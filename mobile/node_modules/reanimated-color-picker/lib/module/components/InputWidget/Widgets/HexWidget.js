import React from 'react';
import { useDerivedValue, useSharedValue } from 'react-native-reanimated';
import colorKit from '../../../colorKit/index';
import WidgetTextInput from './WidgetTextInput';
export default function HexWidget({
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
  const hexColor = useSharedValue(returnedResults().hex);
  useDerivedValue(() => {
    [hueValue, saturationValue, brightnessValue, alphaValue]; // track changes on Native
    hexColor.value = returnedResults().hex;
  }, [hueValue, saturationValue, brightnessValue, alphaValue]); // track changes on WEB

  const onEndEditing = text => {
    var _colorKit$getFormat;
    text = text.startsWith('#') ? text : '#' + text;
    const isHex =
      (_colorKit$getFormat = colorKit.getFormat(text)) === null || _colorKit$getFormat === void 0
        ? void 0
        : _colorKit$getFormat.includes('hex');
    hexColor.value = ''; // force update in case the value of `hexColor` didn't change
    if (isHex) {
      onChange(text);
      return;
    }
  };
  return /*#__PURE__*/ React.createElement(WidgetTextInput, {
    inputStyle: inputStyle,
    textStyle: inputTitleStyle,
    textValue: hexColor,
    title: 'HEX',
    onEndEditing: onEndEditing,
    inputProps: inputProps,
    textKeyboard: true,
  });
}
