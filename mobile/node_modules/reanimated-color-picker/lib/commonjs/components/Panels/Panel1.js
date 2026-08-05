'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.Panel1 = Panel1;
var _react = _interopRequireWildcard(require('react'));
var _reactNative = require('react-native');
var _reactNativeGestureHandler = require('react-native-gesture-handler');
var _reactNativeReanimated = _interopRequireWildcard(require('react-native-reanimated'));
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
/** - A square-shaped slider, reminiscent of Adobe style, is utilized to adjust the brightness and saturation of colors. */
function Panel1({ gestures = [], style = {}, ...props }) {
  const { hueValue, saturationValue, brightnessValue, onGestureChange, onGestureEnd, ...ctx } = (0, _AppContext.default)();
  const thumbShape = props.thumbShape ?? ctx.thumbShape,
    thumbSize = props.thumbSize ?? ctx.thumbSize,
    thumbColor = props.thumbColor ?? ctx.thumbColor,
    boundedThumb = props.boundedThumb ?? ctx.boundedThumb,
    renderThumb = props.renderThumb ?? ctx.renderThumb,
    thumbStyle = props.thumbStyle ?? ctx.thumbStyle ?? {},
    thumbScaleAnimationValue = props.thumbScaleUpValue ?? ctx.thumbScaleAnimationValue,
    thumbScaleAnimationDuration = props.thumbScaleUpDuration ?? ctx.thumbScaleAnimationDuration,
    thumbInnerStyle = props.thumbInnerStyle ?? ctx.thumbInnerStyle ?? {};
  const borderRadius = (0, _utils.getStyle)(style, 'borderRadius') ?? 5;
  const getHeight = (0, _utils.getStyle)(style, 'height') ?? 200;
  const width = (0, _reactNativeReanimated.useSharedValue)(0);
  const height = (0, _reactNativeReanimated.useSharedValue)(0);
  const handleScale = (0, _reactNativeReanimated.useSharedValue)(1);
  const handleStyle = (0, _reactNativeReanimated.useAnimatedStyle)(() => {
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
  const activeColorStyle = (0, _reactNativeReanimated.useAnimatedStyle)(
    () => ({
      backgroundColor: `hsl(${hueValue.value}, 100%, 50%)`,
    }),
    [hueValue],
  );
  const brightnessImageStyle = (0, _reactNativeReanimated.useAnimatedStyle)(() => {
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
          translateY: ((width.value - height.value) / 2) * (_utils.isRtl ? -1 : 1),
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
      newSaturationValue = (posX / lengthX) * 100,
      newBrightnessValue = 100 - (posY / lengthY) * 100;
    if (saturationValue.value === newSaturationValue && brightnessValue.value === newBrightnessValue) return;
    saturationValue.value = newSaturationValue;
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
          activeColorStyle,
        ],
      },
      /*#__PURE__*/ _react.default.createElement(
        _reactNative.View,
        {
          style: [
            _styles.styles.panel_image,
            {
              borderRadius,
            },
          ],
        },
        /*#__PURE__*/ _react.default.createElement(_reactNative.Image, {
          source: require('../../assets/blackGradient.png'),
          style: _styles.styles.panel_image,
          tintColor: '#fff',
          resizeMode: 'stretch',
        }),
        /*#__PURE__*/ _react.default.createElement(_reactNativeReanimated.default.Image, {
          source: require('../../assets/blackGradient.png'),
          style: [_styles.styles.panel_image, brightnessImageStyle],
          resizeMode: 'stretch',
        }),
      ),
      /*#__PURE__*/ _react.default.createElement(_Thumb.default, {
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
