import React from 'react';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { styles } from '../../../styles';
import { enableAndroidHardwareTextures, getStyle } from '../../../utils';
export default function Solid({ width, height, borderRadius, thumbColor, adaptiveColor, handleStyle, style }) {
  const computedStyle = {
    width,
    height,
    borderRadius,
    backgroundColor: thumbColor || 'gray',
    borderWidth: 1,
  };
  const borderColor = getStyle(style, 'borderColor');
  const adaptiveColorStyle = useAnimatedStyle(
    () => ({
      borderColor: borderColor ?? adaptiveColor.value,
    }),
    [adaptiveColor],
  );
  return /*#__PURE__*/ React.createElement(Animated.View, {
    style: [styles.handle, computedStyle, style, styles.shadow, adaptiveColorStyle, handleStyle],
    renderToHardwareTextureAndroid: enableAndroidHardwareTextures,
  });
}
