import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import colorKit from '../../colorKit/index';
import usePickerContext from '../../AppContext';
import { styles } from '../../styles';
import { ConditionalRendering, getStyle } from '../../utils';
import HexWidget from './Widgets/HexWidget';
import HslWidget from './Widgets/HslWidget';
import HsvWidget from './Widgets/HsvWidget';
import HwbWidget from './Widgets/HwbWidget';
import RgbWidget from './Widgets/RgbWidget';
const defaultFormats = ['HEX', 'RGB', 'HSL', 'HWB', 'HSV'];
export function InputWidget({
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
  const { setColor, returnedResults, hueValue, saturationValue, brightnessValue, alphaValue, onGestureChange, onGestureEnd } =
    usePickerContext();
  const [format, setFormat] = useState(formats.includes(defaultFormat) ? defaultFormat : formats[0] ?? 'HEX');
  const onChange = color => {
    var _colorKit$getFormat;
    const isHex =
      (_colorKit$getFormat = colorKit.getFormat(color)) === null || _colorKit$getFormat === void 0
        ? void 0
        : _colorKit$getFormat.includes('hex');
    if (disableAlphaChannel && isHex) color = colorKit.setAlpha(color, 1).hsv().object(false);
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
        return /*#__PURE__*/ React.createElement(HexWidget, inputsProps);
      case 'RGB':
        return /*#__PURE__*/ React.createElement(RgbWidget, inputsProps);
      case 'HSL':
        return /*#__PURE__*/ React.createElement(HslWidget, inputsProps);
      case 'HWB':
        return /*#__PURE__*/ React.createElement(HwbWidget, inputsProps);
      case 'HSV':
        return /*#__PURE__*/ React.createElement(HsvWidget, inputsProps);
    }
  };
  const gap = getStyle(containerStyle, 'gap') ?? 5;
  const iconWidth = getStyle(iconStyle, 'width') ?? 24;
  const buttonIconStyle = StyleSheet.flatten([styles.arrowButton, iconStyle]);
  return /*#__PURE__*/ React.createElement(
    View,
    {
      style: [styles.container, containerStyle],
    },
    /*#__PURE__*/ React.createElement(
      View,
      {
        style: [
          styles.inputsWrapper,
          {
            gap,
          },
        ],
      },
      /*#__PURE__*/ React.createElement(Input, null),
    ),
    /*#__PURE__*/ React.createElement(
      ConditionalRendering,
      {
        if: formats.length > 1,
      },
      /*#__PURE__*/ React.createElement(
        View,
        {
          style: {
            width: iconWidth,
          },
        },
        /*#__PURE__*/ React.createElement(
          Pressable,
          {
            onPress: cycle,
          },
          /*#__PURE__*/ React.createElement(Image, {
            style: buttonIconStyle,
            tintColor: iconColor,
            source: require('../../assets/arrow-icon.png'),
          }),
        ),
        /*#__PURE__*/ React.createElement(
          Text,
          {
            style: styles.inputTitle,
          },
          ' ',
        ),
      ),
    ),
  );
}
