import React from 'react';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { styles } from '../../../styles';
import { enableAndroidHardwareTextures, getStyle } from '../../../utils';
export default function Circle({ width, height, borderRadius, adaptiveColor, handleStyle, innerStyle, solidColor, style }) {
  const computedStyle = {
    width,
    height,
  };
  const circleStyle = {
    borderRadius,
    borderWidth: 1,
    width: '100%',
    height: '100%',
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
      style: [circleStyle, styles.shadow, adaptiveColorStyle, solidColor, innerStyle],
    }),
  );
}
