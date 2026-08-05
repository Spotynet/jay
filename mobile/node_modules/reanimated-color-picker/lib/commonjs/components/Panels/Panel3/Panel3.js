'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.Panel3 = Panel3;
var _react = _interopRequireWildcard(require('react'));
var _reactNative = require('react-native');
var _reactNativeGestureHandler = require('react-native-gesture-handler');
var _reactNativeReanimated = _interopRequireWildcard(require('react-native-reanimated'));
var _index = _interopRequireDefault(require('../../../colorKit/index'));
var _AppContext = _interopRequireDefault(require('../../../AppContext'));
var _styles = require('../../../styles');
var _Thumb = _interopRequireDefault(require('../../Thumb/Thumb'));
var _utils = require('../../../utils');
var _Panel3Context = require('./Panel3Context');
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
/** - The circle-shaped slider, with its wheel style design, is utilized to adjust the hue and (saturation or brightness) of colors. */
function Panel3({
  renderCenterLine = false,
  centerChannel = 'saturation',
  gestures = [],
  style = {},
  rotate = 0,
  children,
  ...props
}) {
  const { hueValue, saturationValue, brightnessValue, onGestureChange, onGestureEnd, ...ctx } = (0, _AppContext.default)();
  const thumbShape = props.thumbShape ?? ctx.thumbShape,
    thumbSize = props.thumbSize ?? ctx.thumbSize,
    thumbColor = props.thumbColor ?? ctx.thumbColor,
    boundedThumb = props.boundedThumb ?? ctx.boundedThumb,
    renderThumb = props.renderThumb ?? ctx.renderThumb,
    thumbStyle = props.thumbStyle ?? ctx.thumbStyle ?? {},
    thumbScaleAnimationValue = props.thumbScaleUpValue ?? ctx.thumbScaleAnimationValue,
    thumbScaleAnimationDuration = props.thumbScaleUpDuration ?? ctx.thumbScaleAnimationDuration,
    thumbInnerStyle = props.thumbInnerStyle ?? ctx.thumbInnerStyle ?? {},
    adaptSpectrum = props.adaptSpectrum ?? ctx.adaptSpectrum;
  const borderRadius = 2000;
  const isGestureActive = (0, _reactNativeReanimated.useSharedValue)(false);
  const width = (0, _reactNativeReanimated.useSharedValue)(0);
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
  const centerChannelValue = (0, _reactNativeReanimated.useDerivedValue)(() => {
    if (centerChannel === 'brightness') return brightnessValue.value;
    if (centerChannel === 'hsl-saturation') return hsl.value.s;
    return saturationValue.value;
  }, [brightnessValue, saturationValue, hsl]);
  const handleStyle = (0, _reactNativeReanimated.useAnimatedStyle)(() => {
    const center = width.value / 2 - (boundedThumb ? thumbSize / 2 : 0),
      rotatedHue = (hueValue.value - rotate) % 360,
      distance = (centerChannelValue.value / 100) * (width.value / 2 - (boundedThumb ? thumbSize / 2 : 0)),
      angle = (rotatedHue * Math.PI) / 180,
      posY = width.value - (Math.sin(angle) * distance + center) - (boundedThumb ? thumbSize : thumbSize / 2),
      posX = width.value - (Math.cos(angle) * distance + center) - (boundedThumb ? thumbSize : thumbSize / 2);
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
  }, [width, centerChannelValue, hueValue, handleScale]);
  const spectrumStyle = (0, _reactNativeReanimated.useAnimatedStyle)(() => {
    if (!adaptSpectrum) return {};
    if (centerChannel === 'brightness') {
      return {
        backgroundColor: `rgba(255, 255, 255, ${1 - saturationValue.value / 100})`,
      };
    }
    if (centerChannel === 'hsl-saturation') {
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
  const centerLineStyle = (0, _reactNativeReanimated.useAnimatedStyle)(() => {
    if (!renderCenterLine) return {};
    const lineThickness = 1,
      center = width.value / 2 - (boundedThumb ? thumbSize / 2 : 0),
      rotatedHue = (hueValue.value - rotate) % 360,
      distance = (centerChannelValue.value / 100) * center,
      angle = ((rotatedHue * Math.PI) / Math.PI + 180) % 360; // reversed angle

    return {
      top: (width.value - lineThickness) / 2,
      left: (width.value - distance) / 2,
      height: lineThickness,
      width: distance,
      transform: [
        {
          rotate: angle + 'deg',
        },
        {
          translateX: distance / 2,
        },
        {
          translateY: 0,
        },
      ],
    };
  }, [width, hueValue, centerChannelValue]);
  const onGestureUpdate = ({ x, y }) => {
    'worklet';

    if (!isGestureActive.value) return;
    const center = (width.value - (boundedThumb ? thumbSize : 0)) / 2,
      dx = center - x + (boundedThumb ? thumbSize / 2 : 0),
      dy = center - y + (boundedThumb ? thumbSize / 2 : 0),
      radius = (0, _utils.clamp)(Math.sqrt(dx * dx + dy * dy), center),
      // distance from center
      theta = Math.atan2(dy, dx) * (180 / Math.PI),
      // [0 - 180] range
      angle = theta < 0 ? 360 + theta : theta,
      // [0 - 360] range
      radiusPercent = radius / center,
      newHueValue = (angle + rotate) % 360,
      newChannelValue = radiusPercent * 100;
    if (hueValue.value === newHueValue && centerChannelValue.value === newChannelValue) return;
    hueValue.value = newHueValue;
    if (centerChannel === 'hsl-saturation') {
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
    } else if (centerChannel === 'brightness') {
      brightnessValue.value = newChannelValue;
    } else {
      saturationValue.value = newChannelValue;
    }
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
  }, []);
  return /*#__PURE__*/ _react.default.createElement(
    _Panel3Context.Panel3ContextProvider,
    {
      value: {
        width,
        adaptSpectrum,
        centerChannel,
        centerChannelValue,
        thumbShape,
        thumbColor,
        thumbStyle,
        thumbInnerStyle,
        renderThumb,
        boundedThumb,
        renderCenterLine,
        thumbSize,
        rotate,
      },
    },
    /*#__PURE__*/ _react.default.createElement(
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
              aspectRatio: 1,
              borderWidth: 0,
              padding: 0,
              borderRadius,
            },
          ],
        },
        /*#__PURE__*/ _react.default.createElement(
          _reactNative.ImageBackground,
          {
            source: require('../../../assets/circularHue.png'),
            style: _styles.styles.panel_image,
            imageStyle: {
              transform: [
                {
                  rotate: -rotate + 'deg',
                },
              ],
            },
            resizeMode: 'stretch',
          },
          /*#__PURE__*/ _react.default.createElement(
            _utils.ConditionalRendering,
            {
              if: adaptSpectrum && centerChannel === 'brightness',
            },
            /*#__PURE__*/ _react.default.createElement(_reactNativeReanimated.default.View, {
              style: [
                {
                  borderRadius,
                },
                spectrumStyle,
                _reactNative.StyleSheet.absoluteFillObject,
              ],
            }),
          ),
          /*#__PURE__*/ _react.default.createElement(_reactNative.Image, {
            source: require('../../../assets/blackRadial.png'),
            style: _styles.styles.panel_image,
            tintColor: centerChannel === 'saturation' ? '#fff' : centerChannel === 'hsl-saturation' ? '#888' : undefined,
            resizeMode: 'stretch',
          }),
          /*#__PURE__*/ _react.default.createElement(
            _utils.ConditionalRendering,
            {
              if: adaptSpectrum && (centerChannel === 'saturation' || centerChannel === 'hsl-saturation'),
            },
            /*#__PURE__*/ _react.default.createElement(_reactNativeReanimated.default.View, {
              style: [
                {
                  borderRadius,
                },
                spectrumStyle,
                _reactNative.StyleSheet.absoluteFillObject,
              ],
            }),
          ),
        ),
        /*#__PURE__*/ _react.default.createElement(
          _utils.ConditionalRendering,
          {
            if: renderCenterLine,
          },
          /*#__PURE__*/ _react.default.createElement(_reactNativeReanimated.default.View, {
            style: [_styles.styles.panel3Line, centerLineStyle],
          }),
        ),
        children,
        /*#__PURE__*/ _react.default.createElement(_Thumb.default, {
          channel: centerChannel === 'brightness' ? 'v' : 's',
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
    ),
  );
}
