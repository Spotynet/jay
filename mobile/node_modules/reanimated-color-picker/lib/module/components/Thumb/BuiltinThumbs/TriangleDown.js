import React from 'react';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { styles } from '../../../styles';
import { enableAndroidHardwareTextures, isRtl } from '../../../utils';
export default function ({ width, height, thumbColor, adaptiveColor, handleStyle, innerStyle, style, vertical }) {
  const computedStyle = {
    width,
    height,
    ...(vertical
      ? {
          justifyContent: 'center',
          alignItems: isRtl ? 'flex-start' : 'flex-end',
        }
      : {
          justifyContent: 'flex-start',
        }),
  };
  const triangleStyle = {
    borderBottomWidth: width / 2,
    borderLeftWidth: width / 4,
    borderRightWidth: width / 4,
    transform: [
      {
        rotate: vertical ? '270deg' : '180deg',
      },
    ],
  };
  const adaptiveColorStyle = useAnimatedStyle(() => {
    return {
      borderBottomColor: thumbColor ?? adaptiveColor.value,
    };
  }, [adaptiveColor]);
  return /*#__PURE__*/ React.createElement(
    Animated.View,
    {
      style: [styles.handle, style, computedStyle, handleStyle],
      renderToHardwareTextureAndroid: enableAndroidHardwareTextures,
    },
    /*#__PURE__*/ React.createElement(Animated.View, {
      style: [styles.triangle, triangleStyle, adaptiveColorStyle, innerStyle],
    }),
  );
}
