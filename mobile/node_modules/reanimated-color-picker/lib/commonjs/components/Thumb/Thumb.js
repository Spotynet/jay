'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.default = Thumb;
var _react = _interopRequireDefault(require('react'));
var _reactNativeReanimated = require('react-native-reanimated');
var _index = _interopRequireDefault(require('../../colorKit/index'));
var _AppContext = _interopRequireDefault(require('../../AppContext'));
var _styles = require('../../styles');
var _index2 = _interopRequireDefault(require('./BuiltinThumbs/index'));
function _interopRequireDefault(e) {
  return e && e.__esModule ? e : { default: e };
}
function Thumb({
  handleStyle,
  innerStyle,
  style,
  thumbColor,
  renderThumb: RenderThumb,
  thumbShape = 'ring',
  thumbSize,
  vertical = false,
  adaptSpectrum,
  channel,
  overrideHSV,
}) {
  const { width, height, borderRadius } = {
    width: thumbSize,
    height: thumbSize,
    borderRadius: thumbSize / 2,
  };
  const { hueValue, saturationValue, brightnessValue, alphaValue, value } = (0, _AppContext.default)();
  const hue = (overrideHSV === null || overrideHSV === void 0 ? void 0 : overrideHSV.hue) ?? hueValue,
    saturation = (overrideHSV === null || overrideHSV === void 0 ? void 0 : overrideHSV.saturation) ?? saturationValue,
    brightness = (overrideHSV === null || overrideHSV === void 0 ? void 0 : overrideHSV.brightness) ?? brightnessValue,
    alpha = (overrideHSV === null || overrideHSV === void 0 ? void 0 : overrideHSV.alpha) ?? alphaValue;
  const resultColor = (0, _reactNativeReanimated.useSharedValue)('#ffffff');
  const solidColor = (0, _reactNativeReanimated.useAnimatedStyle)(
    () => ({
      backgroundColor: thumbColor ?? resultColor.value,
    }),
    [resultColor],
  );
  const adaptiveColor = (0, _reactNativeReanimated.useSharedValue)('#ffffff');

  /**
   * Get the current color and calculate its contrast ratio against white or black, depending on the channel and whether
   * 'adaptSpectrum' is enabled
   */
  const getColorForAdaptiveColor = () => {
    'worklet';

    if (adaptSpectrum) {
      if (channel === 'a') {
        if (alpha.value > 0.5)
          return {
            h: hue.value,
            s: saturation.value,
            v: brightness.value,
          };
        return {
          h: 0,
          s: 0,
          v: 70,
        };
      }
      return {
        h: hue.value,
        s: saturation.value,
        v: brightness.value,
      };
    }
    if (channel === 'h')
      return {
        h: hue.value,
        s: 100,
        v: 100,
      };
    if (channel === 'v')
      return {
        h: hue.value,
        s: 100,
        v: brightness.value,
      };
    if (channel === 's')
      return {
        h: hue.value,
        s: saturation.value,
        v: 70,
      };
    if (channel === 'a')
      return {
        h: hue.value,
        s: alpha.value * 100,
        v: 70,
      };
    return {
      h: hue.value,
      s: saturation.value,
      v: brightness.value,
    };
  };

  // When the values of channels change
  (0, _reactNativeReanimated.useDerivedValue)(() => {
    alpha.value; // to track alpha changes too;
    resultColor.value = _index.default.runOnUI().HEX({
      h: hue.value,
      s: saturation.value,
      v: brightness.value,
    });

    // calculate the contrast ratio
    const compareColor1 = getColorForAdaptiveColor();
    const compareColor2 =
      adaptiveColor.value === '#000000'
        ? {
            h: 0,
            s: 0,
            v: 0,
          }
        : {
            h: 0,
            s: 0,
            v: 100,
          };
    const contrast = _index.default.runOnUI().contrastRatio(compareColor1, compareColor2);
    const reversedColor = adaptiveColor.value === '#ffffff' ? '#000000' : '#ffffff';
    adaptiveColor.value = contrast < 4.5 ? reversedColor : adaptiveColor.value;
  }, [alpha, hue, saturation, brightness]);
  const thumbProps = {
    width,
    height,
    borderRadius,
    vertical,
    solidColor,
    adaptiveColor,
    handleStyle,
    innerStyle,
    style,
    thumbColor,
  };

  // render a custom thumb
  if (RenderThumb)
    return /*#__PURE__*/ _react.default.createElement(RenderThumb, {
      positionStyle: [_styles.styles.handle, handleStyle],
      width: width,
      height: height,
      initialColor: value,
      currentColor: resultColor,
      adaptiveColor: adaptiveColor,
    });

  // normalize 'thumbShape' string to match 'BuiltinThumbs' keys.
  const thumb_Shape = thumbShape.toLowerCase().charAt(0).toUpperCase() + thumbShape.slice(1);
  if (thumb_Shape in _index2.default) {
    const SelectedThumb = _index2.default[thumb_Shape];
    return /*#__PURE__*/ _react.default.createElement(SelectedThumb, thumbProps);
  }

  // default to the 'Ring' thumb
  return /*#__PURE__*/ _react.default.createElement(_index2.default.Ring, thumbProps);
}
