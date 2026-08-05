'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.ExtraThumb = ExtraThumb;
var _react = _interopRequireDefault(require('react'));
var _reactNativeReanimated = _interopRequireWildcard(require('react-native-reanimated'));
var _AppContext = _interopRequireDefault(require('../../../AppContext'));
var _styles = require('../../../styles');
var _Thumb = _interopRequireDefault(require('../../Thumb/Thumb'));
var _utils = require('../../../utils');
var _Panel3Context = _interopRequireDefault(require('./Panel3Context'));
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
function ExtraThumb({
  onChange,
  onChangeJS,
  colorTransform,
  hueTransform,
  saturationTransform,
  brightnessTransform,
  renderThumb,
  ...props
}) {
  const { width, boundedThumb, centerChannel, centerChannelValue, adaptSpectrum, rotate, ...ctx } = (0, _Panel3Context.default)();
  const { hueValue, saturationValue, brightnessValue, alphaValue, returnedResults } = (0, _AppContext.default)();
  const thumbSize = props.thumbSize ?? ctx.thumbSize,
    thumbShape = props.thumbShape ?? ctx.thumbShape,
    thumbColor = props.thumbColor ?? ctx.thumbColor,
    thumbStyle = props.thumbStyle ?? ctx.thumbStyle,
    thumbInnerStyle = props.thumbInnerStyle ?? ctx.thumbInnerStyle,
    renderCenterLine = props.renderCenterLine ?? ctx.renderCenterLine;

  // Calculate color
  const hsv = (0, _reactNativeReanimated.useDerivedValue)(() => {
    const currentColor = {
      h: hueValue.value,
      s: saturationValue.value,
      v: brightnessValue.value,
      a: alphaValue.value,
    };
    if (!colorTransform) return currentColor;
    const transformedColor = colorTransform(currentColor);
    return transformedColor;
  }, [hueValue, saturationValue, brightnessValue, alphaValue]);

  // Calculate hue value
  const hue = (0, _reactNativeReanimated.useDerivedValue)(() => {
    if (colorTransform) return hsv.value.h;
    if (!hueTransform) return hueValue.value;
    const changeAmount = typeof hueTransform === 'string' ? hueValue.value * (parseFloat(hueTransform) / 100) : hueTransform;
    return (0, _utils.clamp)((hueValue.value + changeAmount) % 360, 360);
  }, [hsv, hueValue]);

  // Calculate saturation value
  const saturation = (0, _reactNativeReanimated.useDerivedValue)(() => {
    if (colorTransform) return hsv.value.s;
    if (!saturationTransform) return saturationValue.value;
    const changeAmount =
      typeof saturationTransform === 'string'
        ? saturationValue.value * (parseFloat(saturationTransform) / 100)
        : saturationTransform;
    return (0, _utils.clamp)(saturationValue.value + changeAmount, 100);
  }, [hsv, saturationValue]);

  // Calculate brightness value
  const brightness = (0, _reactNativeReanimated.useDerivedValue)(() => {
    if (colorTransform) return hsv.value.v;
    if (!brightnessTransform) return brightnessValue.value;
    const changeAmount =
      typeof brightnessTransform === 'string'
        ? brightnessValue.value * (parseFloat(brightnessTransform) / 100)
        : brightnessTransform;
    return (0, _utils.clamp)(brightnessValue.value + changeAmount, 100);
  }, [hsv, brightnessValue]);

  // Call onChange prop on every value change
  (0, _reactNativeReanimated.useDerivedValue)(() => {
    if (!onChange && !onChangeJS) return;
    const colors = returnedResults({
      h: hue.value,
      s: saturation.value,
      v: brightness.value,
      a: alphaValue.value,
    });
    if (onChange) onChange(colors);
    if (onChangeJS) (0, _reactNativeReanimated.runOnJS)(onChangeJS)(colors);
  }, [hue, saturation, brightness]);
  const handleStyle = (0, _reactNativeReanimated.useAnimatedStyle)(() => {
    const center = width.value / 2 - (boundedThumb ? thumbSize / 2 : 0),
      rotatedHue = (hue.value - rotate) % 360,
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
          rotate: rotatedHue + 90 + 'deg',
        },
      ],
    };
  }, [thumbSize, boundedThumb, width, centerChannelValue, hue]);
  const centerLineStyle = (0, _reactNativeReanimated.useAnimatedStyle)(() => {
    if (!renderCenterLine) return {};
    const lineThickness = 1,
      center = width.value / 2 - (boundedThumb ? thumbSize / 2 : 0),
      rotatedHue = (hue.value - rotate) % 360,
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
  }, [renderCenterLine, boundedThumb, thumbSize, width, hue, centerChannelValue]);
  return /*#__PURE__*/ _react.default.createElement(
    _react.default.Fragment,
    null,
    /*#__PURE__*/ _react.default.createElement(
      _utils.ConditionalRendering,
      {
        if: renderCenterLine,
      },
      /*#__PURE__*/ _react.default.createElement(_reactNativeReanimated.default.View, {
        style: [_styles.styles.panel3Line, centerLineStyle],
      }),
    ),
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
      overrideHSV: {
        hue,
        saturation,
        brightness,
      },
    }),
  );
}
