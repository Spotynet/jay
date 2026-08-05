import React, { useCallback } from 'react';
import { Image, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import usePickerContext from '../../AppContext';
import { styles } from '../../styles';
import Thumb from '../Thumb/Thumb';
import { clamp, getStyle, isRtl } from '../../utils';
/** - A square-shaped slider, reminiscent of Adobe style, is utilized to adjust the brightness and saturation of colors. */
export function Panel1({ gestures = [], style = {}, ...props }) {
  const { hueValue, saturationValue, brightnessValue, onGestureChange, onGestureEnd, ...ctx } = usePickerContext();
  const thumbShape = props.thumbShape ?? ctx.thumbShape,
    thumbSize = props.thumbSize ?? ctx.thumbSize,
    thumbColor = props.thumbColor ?? ctx.thumbColor,
    boundedThumb = props.boundedThumb ?? ctx.boundedThumb,
    renderThumb = props.renderThumb ?? ctx.renderThumb,
    thumbStyle = props.thumbStyle ?? ctx.thumbStyle ?? {},
    thumbScaleAnimationValue = props.thumbScaleUpValue ?? ctx.thumbScaleAnimationValue,
    thumbScaleAnimationDuration = props.thumbScaleUpDuration ?? ctx.thumbScaleAnimationDuration,
    thumbInnerStyle = props.thumbInnerStyle ?? ctx.thumbInnerStyle ?? {};
  const borderRadius = getStyle(style, 'borderRadius') ?? 5;
  const getHeight = getStyle(style, 'height') ?? 200;
  const width = useSharedValue(0);
  const height = useSharedValue(0);
  const handleScale = useSharedValue(1);
  const handleStyle = useAnimatedStyle(() => {
    const length = {
        x: width.value - (boundedThumb ? thumbSize : 0),
        y: height.value - (boundedThumb ? thumbSize : 0),
      },
      percentX = (saturationValue.value / 100) * length.x,
      posX = percentX - (boundedThumb ? 0 : thumbSize / 2),
      percentY = (brightnessValue.value / 100) * length.y,
      posY = length.y - percentY - (boundedThumb ? 0 : thumbSize / 2);
    return {
      transform: [
        {
          translateX: posX,
        },
        {
          translateY: posY,
        },
        {
          scale: handleScale.value,
        },
      ],
    };
  }, [handleScale, saturationValue, brightnessValue, width, height]);
  const activeColorStyle = useAnimatedStyle(
    () => ({
      backgroundColor: `hsl(${hueValue.value}, 100%, 50%)`,
    }),
    [hueValue],
  );
  const brightnessImageStyle = useAnimatedStyle(() => {
    return {
      width: height.value,
      height: width.value,
      transform: [
        {
          rotate: '270deg',
        },
        {
          translateX: (width.value - height.value) / 2,
        },
        {
          translateY: ((width.value - height.value) / 2) * (isRtl ? -1 : 1),
        },
      ],
    };
  }, [width, height]);
  const onGestureUpdate = ({ x, y }) => {
    'worklet';

    const lengthX = width.value - (boundedThumb ? thumbSize : 0),
      lengthY = height.value - (boundedThumb ? thumbSize : 0),
      posX = clamp(x - (boundedThumb ? thumbSize / 2 : 0), lengthX),
      posY = clamp(y - (boundedThumb ? thumbSize / 2 : 0), lengthY),
      newSaturationValue = (posX / lengthX) * 100,
      newBrightnessValue = 100 - (posY / lengthY) * 100;
    if (saturationValue.value === newSaturationValue && brightnessValue.value === newBrightnessValue) return;
    saturationValue.value = newSaturationValue;
    brightnessValue.value = newBrightnessValue;
    onGestureChange();
  };
  const onGestureBegin = event => {
    'worklet';

    handleScale.value = withTiming(thumbScaleAnimationValue, {
      duration: thumbScaleAnimationDuration,
    });
    onGestureUpdate(event);
  };
  const onGestureFinish = () => {
    'worklet';

    handleScale.value = withTiming(1, {
      duration: thumbScaleAnimationDuration,
    });
    onGestureEnd();
  };
  const pan = Gesture.Pan().onBegin(onGestureBegin).onUpdate(onGestureUpdate).onEnd(onGestureFinish);
  const tap = Gesture.Tap().onEnd(onGestureFinish);
  const longPress = Gesture.LongPress().onEnd(onGestureFinish);
  const composed = Gesture.Simultaneous(Gesture.Exclusive(pan, tap, longPress), ...gestures);
  const onLayout = useCallback(({ nativeEvent: { layout } }) => {
    width.value = layout.width;
    height.value = layout.height;
  }, []);
  return /*#__PURE__*/ React.createElement(
    GestureDetector,
    {
      gesture: composed,
    },
    /*#__PURE__*/ React.createElement(
      Animated.View,
      {
        onLayout: onLayout,
        style: [
          styles.panel_container,
          style,
          {
            position: 'relative',
            height: getHeight,
            borderWidth: 0,
            padding: 0,
          },
          activeColorStyle,
        ],
      },
      /*#__PURE__*/ React.createElement(
        View,
        {
          style: [
            styles.panel_image,
            {
              borderRadius,
            },
          ],
        },
        /*#__PURE__*/ React.createElement(Image, {
          source: require('../../assets/blackGradient.png'),
          style: styles.panel_image,
          tintColor: '#fff',
          resizeMode: 'stretch',
        }),
        /*#__PURE__*/ React.createElement(Animated.Image, {
          source: require('../../assets/blackGradient.png'),
          style: [styles.panel_image, brightnessImageStyle],
          resizeMode: 'stretch',
        }),
      ),
      /*#__PURE__*/ React.createElement(Thumb, {
        thumbShape: thumbShape,
        thumbSize: thumbSize,
        thumbColor: thumbColor,
        renderThumb: renderThumb,
        innerStyle: thumbInnerStyle,
        handleStyle: handleStyle,
        style: thumbStyle,
      }),
    ),
  );
}
