import React, { useRef } from 'react';
import { useDerivedValue, useSharedValue } from 'react-native-reanimated';
import colorKit from '../../../colorKit/index';
import { clamp, ConditionalRendering } from '../../../utils';
import WidgetTextInput from './WidgetTextInput';
export default function HwbWidget({
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
  const hwb = useRef(colorKit.HWB(returnedResults().hwba).object(false));
  const h = useSharedValue(hwb.current.h.toString());
  const w = useSharedValue(hwb.current.w.toString());
  const b = useSharedValue(hwb.current.b.toString());
  const a = useSharedValue(hwb.current.a.toString());
  useDerivedValue(() => {
    [hueValue, saturationValue, brightnessValue, alphaValue]; // track changes on Native
    hwb.current = colorKit.runOnUI().HWB(returnedResults().hwba).object(false);
    h.value = hwb.current.h.toString();
    w.value = hwb.current.w.toString();
    b.value = hwb.current.b.toString();
    a.value = hwb.current.a.toString();
  }, [hueValue, saturationValue, brightnessValue, alphaValue, h, w, b, a]); // track changes on WEB

  const onHueEndEditing = text => {
    const hue = clamp(+text, 360);
    h.value = ''; // force update in case the value of `h` didn't change
    onChange({
      h: hue,
      w: +w.value,
      b: +b.value,
      a: +a.value,
    });
  };
  const onWhiteEndEditing = text => {
    const whiteness = clamp(+text, 100);
    w.value = ''; // force update in case the value of `w` didn't change
    onChange({
      h: +h.value,
      w: whiteness,
      b: +b.value,
      a: +a.value,
    });
  };
  const onBlackEndEditing = text => {
    const blackness = clamp(+text, 100);
    b.value = ''; // force update in case the value of `b` didn't change
    onChange({
      h: +h.value,
      w: +w.value,
      b: blackness,
      a: +a.value,
    });
  };
  const onAlphaEndEditing = text => {
    const alpha = clamp(+text, 1);
    a.value = ''; // force update in case the value of `a` didn't change
    onChange({
      h: +h.value,
      w: +w.value,
      b: +b.value,
      a: alpha,
    });
  };
  return /*#__PURE__*/ React.createElement(
    React.Fragment,
    null,
    /*#__PURE__*/ React.createElement(WidgetTextInput, {
      inputStyle: inputStyle,
      textStyle: inputTitleStyle,
      textValue: h,
      title: 'H',
      onEndEditing: onHueEndEditing,
      inputProps: inputProps,
    }),
    /*#__PURE__*/ React.createElement(WidgetTextInput, {
      inputStyle: inputStyle,
      textStyle: inputTitleStyle,
      textValue: w,
      title: 'W',
      onEndEditing: onWhiteEndEditing,
      inputProps: inputProps,
    }),
    /*#__PURE__*/ React.createElement(WidgetTextInput, {
      inputStyle: inputStyle,
      textStyle: inputTitleStyle,
      textValue: b,
      title: 'B',
      onEndEditing: onBlackEndEditing,
      inputProps: inputProps,
    }),
    /*#__PURE__*/ React.createElement(
      ConditionalRendering,
      {
        if: !disableAlphaChannel,
      },
      /*#__PURE__*/ React.createElement(WidgetTextInput, {
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
