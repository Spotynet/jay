'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.HueCircular = HueCircular;
var _react = _interopRequireWildcard(require('react'));
var _reactNative = require('react-native');
var _reactNativeGestureHandler = require('react-native-gesture-handler');
var _reactNativeReanimated = _interopRequireWildcard(require('react-native-reanimated'));
var _AppContext = _interopRequireDefault(require('../../../AppContext'));
var _styles = require('../../../styles');
var _Thumb = _interopRequireDefault(require('../../Thumb/Thumb'));
var _utils = require('../../../utils');
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
function HueCircular({ children, gestures = [], style = {}, containerStyle = {}, rotate = 0, ...props }) {
  const { hueValue, saturationValue, brightnessValue, onGestureChange, onGestureEnd, ...ctx } = (0, _AppContext.default)();
  const thumbShape = props.thumbShape ?? ctx.thumbShape,
    thumbSize = props.thumbSize ?? ctx.thumbSize,
    thumbColor = props.thumbColor ?? ctx.thumbColor,
    renderThumb = props.renderThumb ?? ctx.renderThumb,
    thumbStyle = props.thumbStyle ?? ctx.thumbStyle ?? {},
    sliderThickness = props.sliderThickness ?? ctx.sliderThickness,
    thumbScaleAnimationValue = props.thumbScaleAnimationValue ?? ctx.thumbScaleAnimationValue,
    thumbScaleAnimationDuration = props.thumbScaleAnimationDuration ?? ctx.thumbScaleAnimationDuration,
    adaptSpectrum = props.adaptSpectrum ?? ctx.adaptSpectrum,
    thumbInnerStyle = props.thumbInnerStyle ?? ctx.thumbInnerStyle ?? {};
  const isGestureActive = (0, _reactNativeReanimated.useSharedValue)(false);
  const width = (0, _reactNativeReanimated.useSharedValue)(0);
  const borderRadius = (0, _reactNativeReanimated.useSharedValue)(0);
  const borderRadiusStyle = (0, _reactNativeReanimated.useAnimatedStyle)(
    () => ({
      borderRadius: borderRadius.value,
    }),
    [borderRadius],
  );
  const handleScale = (0, _reactNativeReanimated.useSharedValue)(1);
  const handleStyle = (0, _reactNativeReanimated.useAnimatedStyle)(() => {
    const center = width.value / 2,
      rotatedHue = (hueValue.value - rotate) % 360,
      distance = (width.value - sliderThickness) / 2,
      angle = (rotatedHue * Math.PI) / 180,
      posY = width.value - (Math.sin(angle) * distance + center) - thumbSize / 2,
      posX = width.value - (Math.cos(angle) * distance + center) - thumbSize / 2;
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
        {
          rotate: rotatedHue + 90 + 'deg',
        },
      ],
    };
  }, [width, hueValue, handleScale]);
  const activeSaturationStyle = (0, _reactNativeReanimated.useAnimatedStyle)(() => {
    if (!adaptSpectrum) return {};
    return {
      backgroundColor: (0, _utils.HSVA2HSLA_string)(0, 0, brightnessValue.value, 1 - saturationValue.value / 100),
    };
  }, [brightnessValue, saturationValue]);
  const activeBrightnessStyle = (0, _reactNativeReanimated.useAnimatedStyle)(() => {
    if (!adaptSpectrum) return {};
    return {
      backgroundColor: (0, _utils.HSVA2HSLA_string)(0, 0, 0, 1 - brightnessValue.value / 100),
    };
  }, [brightnessValue]);
  const clipViewStyle = (0, _reactNativeReanimated.useAnimatedStyle)(() => {
    return {
      position: 'absolute',
      width: width.value - sliderThickness * 2,
      height: width.value - sliderThickness * 2,
      borderRadius: width.value / 2,
    };
  }, [width]);
  const onGestureUpdate = ({ x, y }) => {
    'worklet';

    if (!isGestureActive.value) return;
    const center = width.value / 2,
      dx = center - x,
      dy = center - y,
      theta = Math.atan2(dy, dx) * (180 / Math.PI),
      // [0 - 180] range
      angle = theta < 0 ? 360 + theta : theta,
      // [0 - 360] range
      newHueValue = (angle + rotate) % 360;
    if (hueValue.value === newHueValue) return;
    hueValue.value = newHueValue;
    onGestureChange();
  };
  const onGestureBegin = event => {
    'worklet';

    const R = width.value / 2,
      dx = R - event.x,
      dy = R - event.y,
      clickR = Math.sqrt(dx * dx + dy * dy);

    // Check if the press is outside the circle
    if (clickR > R) {
      isGestureActive.value = false;
      return;
    }

    // check if the press inside the circle (not on the actual slider)
    const innerR = width.value / 2 - sliderThickness;
    if (clickR < innerR) {
      isGestureActive.value = false;
      return;
    }
    isGestureActive.value = true;
    handleScale.value = (0, _reactNativeReanimated.withTiming)(thumbScaleAnimationValue, {
      duration: thumbScaleAnimationDuration,
    });
    onGestureUpdate(event);
  };
  const onGestureFinish = () => {
    'worklet';

    isGestureActive.value = false;
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
    const layoutWidth = layout.width;
    width.value = layoutWidth;
    borderRadius.value = (0, _reactNativeReanimated.withTiming)(layoutWidth / 2, {
      duration: 5,
    });
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
          {
            justifyContent: 'center',
            alignItems: 'center',
          },
          style,
          {
            position: 'relative',
            aspectRatio: 1,
            borderWidth: 0,
            padding: 0,
          },
          borderRadiusStyle,
        ],
      },
      /*#__PURE__*/ _react.default.createElement(
        _reactNative.ImageBackground,
        {
          source: require('../../../assets/circularHue.png'),
          style: [
            _styles.styles.panel_image,
            {
              transform: [
                {
                  rotate: -rotate + 'deg',
                },
              ],
            },
          ],
          resizeMode: 'stretch',
        },
        /*#__PURE__*/ _react.default.createElement(
          _utils.ConditionalRendering,
          {
            if: adaptSpectrum,
          },
          /*#__PURE__*/ _react.default.createElement(_reactNativeReanimated.default.View, {
            style: [borderRadiusStyle, activeBrightnessStyle, _reactNative.StyleSheet.absoluteFillObject],
          }),
          /*#__PURE__*/ _react.default.createElement(_reactNativeReanimated.default.View, {
            style: [borderRadiusStyle, activeSaturationStyle, _reactNative.StyleSheet.absoluteFillObject],
          }),
        ),
      ),
      /*#__PURE__*/ _react.default.createElement(
        _reactNativeReanimated.default.View,
        {
          style: [
            clipViewStyle,
            {
              backgroundColor: '#fff',
            },
            containerStyle,
          ],
        },
        children,
      ),
      /*#__PURE__*/ _react.default.createElement(_Thumb.default, {
        channel: 'h',
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
