import React from 'react';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { styles } from '../../../styles';
import { enableAndroidHardwareTextures } from '../../../utils';
export default function Pill({
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
  const computedStyle = {
    width,
    height,
  };
  const pillStyle = {
    borderRadius,
    borderColor: thumbColor,
    borderWidth: 2,
    width: vertical ? '100%' : 10,
    height: vertical ? 10 : '100%',
  };
  const adaptiveColorStyle = useAnimatedStyle(() => {
    return {
      borderColor: thumbColor ?? adaptiveColor.value,
    };
  }, [adaptiveColor]);
  return /*#__PURE__*/ React.createElement(
    Animated.View,
    {
      style: [styles.handle, computedStyle, style, handleStyle],
      renderToHardwareTextureAndroid: enableAndroidHardwareTextures,
    },
    /*#__PURE__*/ React.createElement(Animated.View, {
      style: [pillStyle, styles.shadow, adaptiveColorStyle, innerStyle],
    }),
  );
}
