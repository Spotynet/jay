import React from 'react';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { styles } from '../../../styles';
import { enableAndroidHardwareTextures, getStyle } from '../../../utils';
export default function Rect({ width, height, adaptiveColor, handleStyle, innerStyle, style, vertical, solidColor }) {
  const computedStyle = {
    width,
    height,
  };
  const pillStyle = {
    borderWidth: 1,
    width: vertical ? '100%' : 14,
    height: vertical ? 14 : '100%',
  };
  const borderColor = getStyle(innerStyle, 'borderColor');
  const adaptiveColorStyle = useAnimatedStyle(
    () => ({
      borderColor: borderColor ?? adaptiveColor.value,
    }),
    [adaptiveColor],
  );
  return /*#__PURE__*/ React.createElement(
    Animated.View,
    {
      style: [styles.handle, style, computedStyle, handleStyle],
      renderToHardwareTextureAndroid: enableAndroidHardwareTextures,
    },
    /*#__PURE__*/ React.createElement(Animated.View, {
      style: [pillStyle, styles.shadow, adaptiveColorStyle, solidColor, innerStyle],
    }),
  );
}
