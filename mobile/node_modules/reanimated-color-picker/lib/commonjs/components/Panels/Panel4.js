'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.Panel4 = Panel4;
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
/** - A slider with a square shape is used to adjust the channels of hue, saturation, and brightness. */
function Panel4({ reverseHue = false, reverseHorizontalChannels = false, gestures = [], style = {}, ...props }) {
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
      calcThumb = boundedThumb ? 0 : thumbSize / 2,
      // luminance
      lum = (((2 - saturationValue.value / 100) * (brightnessValue.value / 100)) / 2) * 100,
      posPercentX = (lum / 100) * length.x,
      posX = (reverseHorizontalChannels ? posPercentX : length.x - posPercentX) - calcThumb,
      // hue
      percentY = (hueValue.value / 360) * length.y,
      posY = (reverseHue ? percentY : length.y - percentY) - calcThumb;
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
  }, [width, height, saturationValue, brightnessValue, hueValue, handleScale]);
  const panelImageStyle = (0, _reactNativeReanimated.useAnimatedStyle)(() => {
    return {
      width: height.value,
      height: width.value,
      transform: [
        {
          scaleY: reverseHue ? -1 : 1,
        },
        {
          rotate: '270deg',
        },
        {
          translateX: ((width.value - height.value) / 2) * (reverseHue ? -1 : 1),
        },
        {
          translateY: ((width.value - height.value) / 2) * (_utils.isRtl ? -1 : 1),
        },
      ],
    };
  }, [height, width]);
  const onGestureUpdate = ({ x, y }) => {
    'worklet';

    const lengthX = width.value - (boundedThumb ? thumbSize : 0),
      lengthY = height.value - (boundedThumb ? thumbSize : 0),
      posX = (0, _utils.clamp)(x - (boundedThumb ? thumbSize / 2 : 0), lengthX),
      posY = (0, _utils.clamp)(y - (boundedThumb ? thumbSize / 2 : 0), lengthY),
      valueX = (posX / lengthX) * 200,
      valueY = (posY / lengthY) * 360,
      newHueValue = reverseHue ? valueY : 360 - valueY,
      newSaturationValue = (0, _utils.clamp)(reverseHorizontalChannels ? 200 - valueX : valueX, 100),
      newBrightnessValue = (0, _utils.clamp)(reverseHorizontalChannels ? valueX : 200 - valueX, 100);
    if (
      hueValue.value === newHueValue &&
      saturationValue.value === newSaturationValue &&
      brightnessValue.value === newBrightnessValue
    )
      return;
    hueValue.value = newHueValue;
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
          source: require('../../assets/Hue.png'),
          style: [_styles.styles.panel_image, panelImageStyle],
          resizeMode: 'stretch',
        }),
      ),
      /*#__PURE__*/ _react.default.createElement(
        _reactNative.View,
        {
          style: [
            _styles.styles.panel_image,
            {
              borderRadius,
              flexDirection: _utils.isRtl ? 'row-reverse' : 'row',
              transform: [
                {
                  scaleX: reverseHorizontalChannels ? -1 : 1,
                },
              ],
            },
          ],
        },
        /*#__PURE__*/ _react.default.createElement(_reactNative.Image, {
          source: require('../../assets/blackGradient.png'),
          style: {
            flex: 1,
          },
          tintColor: '#fff',
          resizeMode: 'stretch',
        }),
        /*#__PURE__*/ _react.default.createElement(_reactNative.Image, {
          source: require('../../assets/blackGradient.png'),
          style: {
            flex: 1,
            transform: [
              {
                scaleX: -1,
              },
            ],
          },
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
