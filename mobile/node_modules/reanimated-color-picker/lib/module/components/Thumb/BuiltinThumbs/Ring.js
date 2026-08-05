import React from 'react';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import colorKit from '../../../colorKit/index';
import { styles } from '../../../styles';
import { enableAndroidHardwareTextures, getStyle } from '../../../utils';
export default function Ring({ width, height, borderRadius, adaptiveColor, handleStyle, innerStyle, solidColor, style }) {
  const ringStyle = {
    width,
    height,
    borderRadius,
    borderWidth: 1,
  };
  const borderColor = getStyle(style, 'borderColor');
  const ringBackgroundColor = getStyle(style, 'backgroundColor');
  const adaptiveColorStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: ringBackgroundColor ?? colorKit.runOnUI().setAlpha(adaptiveColor.value, 0.5).hex(),
      borderColor: borderColor ?? adaptiveColor.value,
    };
  }, [adaptiveColor]);

  // Make sure to match the parity (odd or even) of the parent width, to solve the centering issue
  const innerWidth = 0.75 * width;
  const innerSize = width % 2 === 0 ? Math.floor(innerWidth / 2) * 2 : Math.floor(innerWidth / 2) * 2 + 1;
  return /*#__PURE__*/ React.createElement(
    Animated.View,
    {
      style: [styles.handle, ringStyle, adaptiveColorStyle, style, handleStyle],
      renderToHardwareTextureAndroid: enableAndroidHardwareTextures,
    },
    /*#__PURE__*/ React.createElement(Animated.View, {
      style: [
        styles.shadow,
        {
          borderRadius,
          zIndex: 100,
          width: innerSize,
          height: innerSize,
        },
        solidColor,
        innerStyle,
      ],
    }),
  );
}
