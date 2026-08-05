import React from 'react';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { styles } from '../../../styles';
import { enableAndroidHardwareTextures } from '../../../utils';
export default function Line({
  width,
  height,
  borderRadius,
  thumbColor,
  adaptiveColor,
  handleStyle,
  innerStyle,
  style,
  vertical,
}) {
  const thickness = 3;
  const computedStyle = {
    width,
    height,
  };
  const lineStyle = {
    borderRadius,
    backgroundColor: thumbColor,
    width: vertical ? '100%' : thickness,
    height: vertical ? thickness : '100%',
  };
  const adaptiveColorStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: thumbColor ?? adaptiveColor.value,
    };
  }, [adaptiveColor]);
  return /*#__PURE__*/ React.createElement(
    Animated.View,
    {
      style: [styles.handle, style, computedStyle, handleStyle],
      renderToHardwareTextureAndroid: enableAndroidHardwareTextures,
    },
    /*#__PURE__*/ React.createElement(Animated.View, {
      style: [lineStyle, styles.shadow, adaptiveColorStyle, innerStyle],
    }),
  );
}
