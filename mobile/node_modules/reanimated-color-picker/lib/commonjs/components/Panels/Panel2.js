'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.Panel2 = Panel2;
var _react = _interopRequireWildcard(require('react'));
var _reactNative = require('react-native');
var _reactNativeGestureHandler = require('react-native-gesture-handler');
var _reactNativeReanimated = _interopRequireWildcard(require('react-native-reanimated'));
var _index = _interopRequireDefault(require('../../colorKit/index'));
var _AppContext = _interopRequireDefault(require('../../AppContext'));
var _styles = require('../../styles');
var _Thumb = _interopRequireDefault(require('../Thumb/Thumb'));
var _utils = require('../../utils');
function _interopRequireDefault(e) {
  return e && e.__esModule ? e : { default: e };
}
function _getRequireWildcardCache(e) {
  if ('function' != typeof WeakMap) return null;
  var r = new WeakMap(),
    t = new WeakMap();
  return (_getRequireWildcardCache = function (e) {
    return e ? t : r;
  })(e);
}
function _interopRequireWildcard(e, r) {
  if (!r && e && e.__esModule) return e;
  if (null === e || ('object' != typeof e && 'function' != typeof e)) return { default: e };
  var t = _getRequireWildcardCache(r);
  if (t && t.has(e)) return t.get(e);
  var n = { __proto__: null },
    a = Object.defineProperty && Object.getOwnPropertyDescriptor;
  for (var u in e)
    if ('default' !== u && {}.hasOwnProperty.call(e, u)) {
      var i = a ? Object.getOwnPropertyDescriptor(e, u) : null;
      i && (i.get || i.set) ? Object.defineProperty(n, u, i) : (n[u] = e[u]);
    }
  return (n.default = e), t && t.set(e, n), n;
}
/** - A square-shaped slider (windows style) is utilized to adjust the hue and (saturation or brightness) channels. */
function Panel2({
  verticalChannel = 'saturation',
  reverseHue = false,
  reverseVerticalChannel = false,
  gestures = [],
  style = {},
  ...props
}) {
  const { hueValue, saturationValue, brightnessValue, onGestureChange, onGestureEnd, ...ctx } = (0, _AppContext.default)();
  const thumbShape = props.thumbShape ?? ctx.thumbShape,
    thumbSize = props.thumbSize ?? ctx.thumbSize,
    thumbColor = props.thumbColor ?? ctx.thumbColor,
    boundedThumb = props.boundedThumb ?? ctx.boundedThumb,
    renderThumb = props.renderThumb ?? ctx.renderThumb,
    thumbStyle = props.thumbStyle ?? ctx.thumbStyle ?? {},
    thumbInnerStyle = props.thumbInnerStyle ?? ctx.thumbInnerStyle ?? {},
    thumbScaleAnimationValue = props.thumbScaleUpValue ?? ctx.thumbScaleAnimationValue,
    thumbScaleAnimationDuration = props.thumbScaleUpDuration ?? ctx.thumbScaleAnimationDuration,
    adaptSpectrum = props.adaptSpectrum ?? ctx.adaptSpectrum;
  const borderRadius = (0, _utils.getStyle)(style, 'borderRadius') ?? 5;
  const getHeight = (0, _utils.getStyle)(style, 'height') ?? 200;
  const width = (0, _reactNativeReanimated.useSharedValue)(0);
  const height = (0, _reactNativeReanimated.useSharedValue)(0);
  const handleScale = (0, _reactNativeReanimated.useSharedValue)(1);
  const lastHslSaturationValue = (0, _reactNativeReanimated.useSharedValue)(0);

  // We need to keep track of the HSL saturation value because, when the luminance is 0 or 100,
  // when converting to/from HSV, the previous saturation value will be lost.
  const hsl = (0, _reactNativeReanimated.useDerivedValue)(() => {
    const hsvColor = {
      h: hueValue.value,
      s: saturationValue.value,
      v: brightnessValue.value,
    };
    const { h, s, l } = _index.default.runOnUI().HSL(hsvColor).object(false);
    if (l === 100 || l === 0)
      return {
        h,
        s: lastHslSaturationValue.value,
        l,
      };
    lastHslSaturationValue.value = s;
    return {
      h,
      s,
      l,
    };
  }, [hueValue, saturationValue, brightnessValue]);
  const verticalChannelValue = (0, _reactNativeReanimated.useDerivedValue)(() => {
    if (verticalChannel === 'brightness') return brightnessValue.value;
    if (verticalChannel === 'hsl-saturation') return hsl.value.s;
    return saturationValue.value;
  }, [brightnessValue, saturationValue, hsl]);
  const handleStyle = (0, _reactNativeReanimated.useAnimatedStyle)(() => {
    const length = {
        x: width.value - (boundedThumb ? thumbSize : 0),
        y: height.value - (boundedThumb ? thumbSize : 0),
      },
      percentX = (hueValue.value / 360) * length.x,
      posX = (reverseHue ? length.x - percentX : percentX) - (boundedThumb ? 0 : thumbSize / 2),
      percentY = (verticalChannelValue.value / 100) * length.y,
      posY = (reverseVerticalChannel ? percentY : length.y - percentY) - (boundedThumb ? 0 : thumbSize / 2);
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
  }, [width, height, hueValue, verticalChannelValue, handleScale]);
  const spectrumStyle = (0, _reactNativeReanimated.useAnimatedStyle)(() => {
    if (!adaptSpectrum) return {};
    if (verticalChannel === 'brightness') {
      return {
        backgroundColor: `rgba(255, 255, 255, ${1 - saturationValue.value / 100})`,
      };
    }
    if (verticalChannel === 'hsl-saturation') {
      if (hsl.value.l < 50)
        return {
          backgroundColor: `rgba(0, 0, 0, ${1 - hsl.value.l / 50})`,
        };
      return {
        backgroundColor: `rgba(255, 255, 255, ${(hsl.value.l - 50) / 50})`,
      };
    }
    return {
      backgroundColor: `rgba(0, 0, 0, ${1 - brightnessValue.value / 100})`,
    };
  }, [saturationValue, brightnessValue]);
  const panelImageStyle = (0, _reactNativeReanimated.useAnimatedStyle)(() => {
    return {
      width: height.value,
      height: width.value,
      transform: [
        {
          rotate: reverseVerticalChannel ? '90deg' : '270deg',
        },
        {
          translateX: ((width.value - height.value) / 2) * (reverseVerticalChannel ? -1 : 1),
        },
        {
          translateY: ((width.value - height.value) / 2) * (_utils.isRtl ? -1 : 1) * (reverseVerticalChannel ? -1 : 1),
        },
      ],
    };
  }, [width, height]);
  const onGestureUpdate = ({ x, y }) => {
    'worklet';

    const lengthX = width.value - (boundedThumb ? thumbSize : 0),
      lengthY = height.value - (boundedThumb ? thumbSize : 0),
      posX = (0, _utils.clamp)(x - (boundedThumb ? thumbSize / 2 : 0), lengthX),
      posY = (0, _utils.clamp)(y - (boundedThumb ? thumbSize / 2 : 0), lengthY),
      valueX = (posX / lengthX) * 360,
      valueY = (posY / lengthY) * 100,
      newHueValue = reverseHue ? 360 - valueX : valueX,
      newChannelValue = reverseVerticalChannel ? valueY : 100 - valueY;
    if (hueValue.value === newHueValue && verticalChannelValue.value === newChannelValue) return;
    hueValue.value = newHueValue;
    if (verticalChannel === 'hsl-saturation') {
      // To prevent locking this slider when the luminance is 0 or 100,
      // this should not affect the resulting color, as the value will be rounded.
      const l = hsl.value.l === 0 ? 0.01 : hsl.value.l === 100 ? 99.99 : hsl.value.l;
      const { s, v } = _index.default
        .runOnUI()
        .HSV({
          h: hsl.value.h,
          s: newChannelValue,
          l,
        })
        .object(false);
      saturationValue.value = s;
      brightnessValue.value = v;
    } else if (verticalChannel === 'brightness') {
      brightnessValue.value = newChannelValue;
    } else {
      saturationValue.value = newChannelValue;
    }
    onGestureChange();
  };
  const onGestureBegin = event => {
    'worklet';

    handleScale.value = (0, _reactNativeReanimated.withTiming)(thumbScaleAnimationValue, {
      duration: thumbScaleAnimationDuration,
    });
    onGestureUpdate(event);
  };
  const onGestureFinish = () => {
    'worklet';

    handleScale.value = (0, _reactNativeReanimated.withTiming)(1, {
      duration: thumbScaleAnimationDuration,
    });
    onGestureEnd();
  };
  const pan = _reactNativeGestureHandler.Gesture.Pan().onBegin(onGestureBegin).onUpdate(onGestureUpdate).onEnd(onGestureFinish);
  const tap = _reactNativeGestureHandler.Gesture.Tap().onEnd(onGestureFinish);
  const longPress = _reactNativeGestureHandler.Gesture.LongPress().onEnd(onGestureFinish);
  const composed = _reactNativeGestureHandler.Gesture.Simultaneous(
    _reactNativeGestureHandler.Gesture.Exclusive(pan, tap, longPress),
    ...gestures,
  );
  const onLayout = (0, _react.useCallback)(({ nativeEvent: { layout } }) => {
    width.value = layout.width;
    height.value = layout.height;
  }, []);
  return /*#__PURE__*/ _react.default.createElement(
    _reactNativeGestureHandler.GestureDetector,
    {
      gesture: composed,
    },
    /*#__PURE__*/ _react.default.createElement(
      _reactNativeReanimated.default.View,
      {
        onLayout: onLayout,
        style: [
          _styles.styles.panel_container,
          style,
          {
            position: 'relative',
            height: getHeight,
            borderWidth: 0,
            padding: 0,
          },
        ],
      },
      /*#__PURE__*/ _react.default.createElement(
        _reactNative.ImageBackground,
        {
          source: require('../../assets/Hue.png'),
          style: [
            _styles.styles.panel_image,
            {
              position: 'relative',
              borderRadius,
              transform: [
                {
                  scaleX: reverseHue ? -1 : 1,
                },
              ],
            },
          ],
          resizeMode: 'stretch',
        },
        /*#__PURE__*/ _react.default.createElement(
          _utils.ConditionalRendering,
          {
            if: adaptSpectrum && verticalChannel === 'brightness',
          },
          /*#__PURE__*/ _react.default.createElement(_reactNativeReanimated.default.View, {
            style: [spectrumStyle, _reactNative.StyleSheet.absoluteFillObject],
          }),
        ),
        /*#__PURE__*/ _react.default.createElement(_reactNativeReanimated.default.Image, {
          source: require('../../assets/blackGradient.png'),
          style: [_styles.styles.panel_image, panelImageStyle],
          tintColor: verticalChannel === 'saturation' ? '#fff' : verticalChannel === 'hsl-saturation' ? '#888' : undefined,
          resizeMode: 'stretch',
        }),
        /*#__PURE__*/ _react.default.createElement(
          _utils.ConditionalRendering,
          {
            if: adaptSpectrum && (verticalChannel === 'saturation' || verticalChannel === 'hsl-saturation'),
          },
          /*#__PURE__*/ _react.default.createElement(_reactNativeReanimated.default.View, {
            style: [spectrumStyle, _reactNative.StyleSheet.absoluteFillObject],
          }),
        ),
      ),
      /*#__PURE__*/ _react.default.createElement(_Thumb.default, {
        channel: verticalChannel === 'brightness' ? 'v' : 's',
        thumbShape: thumbShape,
        thumbSize: thumbSize,
        thumbColor: thumbColor,
        renderThumb: renderThumb,
        innerStyle: thumbInnerStyle,
        handleStyle: handleStyle,
        style: thumbStyle,
        adaptSpectrum: adaptSpectrum,
      }),
    ),
  );
}
