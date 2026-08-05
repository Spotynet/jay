import React from 'react';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { styles } from '../../../styles';
import { enableAndroidHardwareTextures } from '../../../utils';
export default function Plus({
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
  const thickness = 2;
  const computedStyle = {
    width,
    height,
    borderRadius,
    borderWidth: thickness,
  };
  const line1 = {
    borderRadius,
    position: 'absolute',
    width: vertical ? '100%' : thickness,
    height: vertical ? thickness : '100%',
  };
  const line2 = {
    borderRadius,
    width: vertical ? thickness : '100%',
    height: vertical ? '100%' : thickness,
  };
  const adaptiveColorStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: thumbColor ?? adaptiveColor.value,
    };
  }, [adaptiveColor]);
  const adaptiveBorderColorStyle = useAnimatedStyle(() => {
    return {
      borderColor: thumbColor ?? adaptiveColor.value,
    };
  }, [adaptiveColor]);
  return /*#__PURE__*/ React.createElement(
    Animated.View,
    {
      style: [styles.handle, style, computedStyle, adaptiveBorderColorStyle, handleStyle],
      renderToHardwareTextureAndroid: enableAndroidHardwareTextures,
    },
    /*#__PURE__*/ React.createElement(Animated.View, {
      style: [line1, styles.shadow, adaptiveColorStyle, innerStyle],
    }),
    /*#__PURE__*/ React.createElement(Animated.View, {
      style: [line2, styles.shadow, adaptiveColorStyle, innerStyle],
    }),
  );
}
