'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.RedSlider = RedSlider;
var _react = _interopRequireDefault(require('react'));
var _reactNative = require('react-native');
var _reactNativeGestureHandler = require('react-native-gesture-handler');
var _reactNativeReanimated = _interopRequireWildcard(require('react-native-reanimated'));
var _index = _interopRequireDefault(require('../../../colorKit/index'));
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
function RedSlider({ gestures = [], style = {}, vertical = false, reverse = false, ...props }) {
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
  const rgb = (0, _reactNativeReanimated.useDerivedValue)(() => {
    return _index.default
      .runOnUI()
      .RGB({
        h: hueValue.value,
        s: saturationValue.value,
        v: brightnessValue.value,
      })
      .object(false);
  }, [hueValue, saturationValue, brightnessValue]);
  const handleStyle = (0, _reactNativeReanimated.useAnimatedStyle)(() => {
    const length = (vertical ? height.value : width.value) - (boundedThumb ? thumbSize : 0),
      percent = (rgb.value.r / 255) * length,
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
  }, [rgb, width, height, handleScale]);
  const imageStyle = (0, _reactNativeReanimated.useAnimatedStyle)(() => {
    if (_utils.isWeb) return {};
    const imageRotate = vertical ? (reverse ? '90deg' : '270deg') : reverse ? '0deg' : '180deg';
    const imageTranslateY =
      ((height.value - width.value) / 2) * ((reverse && _utils.isRtl) || (!reverse && !_utils.isRtl) ? -1 : 1);
    return {
      tintColor: `rgb(255, ${Math.round(rgb.value.g)}, ${Math.round(rgb.value.b)})`,
      width: vertical ? height.value : '100%',
      height: vertical ? width.value : '100%',
      transform: [
        {
          rotate: imageRotate,
        },
        {
          translateX: vertical ? ((height.value - width.value) / 2) * (reverse ? 1 : -1) : 0,
        },
        {
          translateY: vertical ? imageTranslateY : 0,
        },
      ],
    };
  }, [rgb, width, height]);
  const greenBlue = (0, _reactNativeReanimated.useAnimatedStyle)(() => {
    const g = Math.round(rgb.value.g);
    const b = Math.round(rgb.value.b);
    if (_utils.isWeb) {
      const deg = vertical ? (reverse ? 180 : 0) : reverse ? 90 : 270;
      return {
        background: `linear-gradient(${deg}deg, rgb(255, ${g}, ${b}) 0%, rgb(0, ${g}, ${b}) 100%)`,
      };
    }
    return {
      backgroundColor: `rgb(0, ${g}, ${b})`,
    };
  }, [rgb]);
  const onGestureUpdate = ({ x, y }) => {
    'worklet';

    const length = (vertical ? height.value : width.value) - (boundedThumb ? thumbSize : 0),
      pos = (0, _utils.clamp)((vertical ? y : x) - (boundedThumb ? thumbSize / 2 : 0), length),
      value = (pos / length) * 255,
      newRedValue = reverse ? 255 - value : value;
    if (newRedValue === rgb.value.r) return;
    const { h, s, v } = _index.default
      .runOnUI()
      .HSV({
        r: newRedValue,
        g: rgb.value.g,
        b: rgb.value.b,
      })
      .object(false);
    hueValue.value = h;
    saturationValue.value = s;
    brightnessValue.value = v;
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
          greenBlue,
        ],
      },
      /*#__PURE__*/ _react.default.createElement(
        _utils.RenderNativeOnly,
        null,
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
      ),
      /*#__PURE__*/ _react.default.createElement(_Thumb.default, {
        thumbShape: thumbShape,
        thumbSize: thumbSize,
        thumbColor: thumbColor,
        renderThumb: renderThumb,
        innerStyle: thumbInnerStyle,
        handleStyle: handleStyle,
        style: thumbStyle,
        vertical: vertical,
      }),
    ),
  );
}
