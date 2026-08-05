'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.BrightnessSlider = BrightnessSlider;
var _react = _interopRequireDefault(require('react'));
var _reactNative = require('react-native');
var _reactNativeGestureHandler = require('react-native-gesture-handler');
var _reactNativeReanimated = _interopRequireWildcard(require('react-native-reanimated'));
var _AppContext = _interopRequireDefault(require('../../../AppContext'));
var _Thumb = _interopRequireDefault(require('../../Thumb/Thumb'));
var _utils = require('../../../utils');
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
function _interopRequireDefault(e) {
  return e && e.__esModule ? e : { default: e };
}
function BrightnessSlider({ gestures = [], style = {}, vertical = false, reverse = false, ...props }) {
  const { hueValue, saturationValue, brightnessValue, onGestureChange, onGestureEnd, ...ctx } = (0, _AppContext.default)();
  const thumbShape = props.thumbShape ?? ctx.thumbShape,
    thumbSize = props.thumbSize ?? ctx.thumbSize,
    thumbColor = props.thumbColor ?? ctx.thumbColor,
    boundedThumb = props.boundedThumb ?? ctx.boundedThumb,
    renderThumb = props.renderThumb ?? ctx.renderThumb,
    thumbStyle = props.thumbStyle ?? ctx.thumbStyle ?? {},
    thumbInnerStyle = props.thumbInnerStyle ?? ctx.thumbInnerStyle ?? {},
    thumbScaleAnimationValue = props.thumbScaleAnimationValue ?? ctx.thumbScaleAnimationValue,
    thumbScaleAnimationDuration = props.thumbScaleAnimationDuration ?? ctx.thumbScaleAnimationDuration,
    adaptSpectrum = props.adaptSpectrum ?? ctx.adaptSpectrum,
    sliderThickness = props.sliderThickness ?? ctx.sliderThickness;
  const borderRadius = (0, _utils.getStyle)(style, 'borderRadius') ?? 5,
    getWidth = (0, _utils.getStyle)(style, 'width'),
    getHeight = (0, _utils.getStyle)(style, 'height');
  const width = (0, _reactNativeReanimated.useSharedValue)(
    vertical ? sliderThickness : typeof getWidth === 'number' ? getWidth : 0,
  );
  const height = (0, _reactNativeReanimated.useSharedValue)(
    !vertical ? sliderThickness : typeof getHeight === 'number' ? getHeight : 0,
  );
  const handleScale = (0, _reactNativeReanimated.useSharedValue)(1);
  const handleStyle = (0, _reactNativeReanimated.useAnimatedStyle)(() => {
    const length = (vertical ? height.value : width.value) - (boundedThumb ? thumbSize : 0),
      percent = (brightnessValue.value / 100) * length,
      pos = (reverse ? length - percent : percent) - (boundedThumb ? 0 : thumbSize / 2),
      posY = vertical ? pos : height.value / 2 - thumbSize / 2,
      posX = vertical ? width.value / 2 - thumbSize / 2 : pos;
    return {
      transform: [
        {
          translateY: posY,
        },
        {
          translateX: posX,
        },
        {
          scale: handleScale.value,
        },
      ],
    };
  }, [height, width, brightnessValue, handleScale]);
  const activeColorStyle = (0, _reactNativeReanimated.useAnimatedStyle)(() => {
    return {
      backgroundColor: (0, _utils.HSVA2HSLA_string)(hueValue.value, adaptSpectrum ? saturationValue.value : 100, 100),
    };
  }, [hueValue, saturationValue]);
  const imageStyle = (0, _reactNativeReanimated.useAnimatedStyle)(() => {
    const imageRotate = vertical ? (reverse ? '270deg' : '90deg') : reverse ? '180deg' : '0deg';
    const imageTranslateY =
      ((height.value - width.value) / 2) * ((reverse && _utils.isRtl) || (!reverse && !_utils.isRtl) ? 1 : -1);
    return {
      width: vertical ? height.value : '100%',
      height: vertical ? width.value : '100%',
      transform: [
        {
          rotate: imageRotate,
        },
        {
          translateX: vertical ? ((height.value - width.value) / 2) * (reverse ? -1 : 1) : 0,
        },
        {
          translateY: vertical ? imageTranslateY : 0,
        },
      ],
    };
  }, [height, width]);
  const onGestureUpdate = ({ x, y }) => {
    'worklet';

    const length = (vertical ? height.value : width.value) - (boundedThumb ? thumbSize : 0),
      pos = (0, _utils.clamp)((vertical ? y : x) - (boundedThumb ? thumbSize / 2 : 0), length),
      value = (pos / length) * 100,
      newBrightnessValue = reverse ? 100 - value : value;
    if (brightnessValue.value === newBrightnessValue) return;
    brightnessValue.value = newBrightnessValue;
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
  const onLayout = ({ nativeEvent: { layout } }) => {
    if (!vertical)
      width.value = (0, _reactNativeReanimated.withTiming)(layout.width, {
        duration: 5,
      });
    if (vertical)
      height.value = (0, _reactNativeReanimated.withTiming)(layout.height, {
        duration: 5,
      });
  };
  const thicknessStyle = vertical
    ? {
        width: sliderThickness,
      }
    : {
        height: sliderThickness,
      };
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
          style,
          {
            position: 'relative',
            borderRadius,
            borderWidth: 0,
            padding: 0,
          },
          thicknessStyle,
          activeColorStyle,
        ],
      },
      /*#__PURE__*/ _react.default.createElement(
        _reactNative.View,
        {
          style: {
            flex: 1,
            borderRadius,
            overflow: 'hidden',
          },
        },
        /*#__PURE__*/ _react.default.createElement(_reactNativeReanimated.default.Image, {
          source: require('../../../assets/blackGradient.png'),
          style: imageStyle,
        }),
      ),
      /*#__PURE__*/ _react.default.createElement(_Thumb.default, {
        channel: 'v',
        thumbShape: thumbShape,
        thumbSize: thumbSize,
        thumbColor: thumbColor,
        renderThumb: renderThumb,
        innerStyle: thumbInnerStyle,
        handleStyle: handleStyle,
        style: thumbStyle,
        adaptSpectrum: adaptSpectrum,
        vertical: vertical,
      }),
    ),
  );
}
