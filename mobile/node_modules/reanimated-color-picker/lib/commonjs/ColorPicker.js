'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.default = void 0;
var _react = _interopRequireWildcard(require('react'));
var _reactNative = require('react-native');
var _reactNativeGestureHandler = require('react-native-gesture-handler');
var _reactNativeReanimated = require('react-native-reanimated');
var _index = _interopRequireDefault(require('./colorKit/index'));
var _AppContext = require('./AppContext');
var _utils = require('./utils');
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
// @ts-expect-error no global
if (_utils.isWeb && !global.setImmediate) {
  // @ts-expect-error no global
  global.setImmediate = setTimeout;
}
const ColorPicker = /*#__PURE__*/ (0, _react.forwardRef)(
  (
    {
      adaptSpectrum = false,
      sliderThickness = 25,
      thumbAnimationDuration = 200,
      thumbSize = 35,
      thumbShape = 'ring',
      boundedThumb = false,
      thumbScaleAnimationValue = 1.2,
      thumbScaleAnimationDuration = 100,
      thumbColor,
      renderThumb,
      thumbStyle,
      thumbInnerStyle,
      value = '#fff',
      onChange,
      onChangeJS,
      onComplete,
      onCompleteJS,
      style = {},
      children = /*#__PURE__*/ _react.default.createElement(_reactNative.Text, null, 'NO CHILDREN'),
    },
    ref,
  ) => {
    const initialColor = (0, _react.useRef)(_index.default.HSV(value).object(false)).current;
    // color's channels values.
    const hueValue = (0, _reactNativeReanimated.useSharedValue)(initialColor.h);
    const saturationValue = (0, _reactNativeReanimated.useSharedValue)(initialColor.s);
    const brightnessValue = (0, _reactNativeReanimated.useSharedValue)(initialColor.v);
    const alphaValue = (0, _reactNativeReanimated.useSharedValue)(initialColor.a);
    const returnedResults = inputColor => {
      'worklet';

      const color = inputColor ?? {
        h: hueValue.value,
        s: saturationValue.value,
        v: brightnessValue.value,
        a: alphaValue.value,
      };
      return {
        get hex() {
          return _index.default.runOnUI().HEX(color);
        },
        get rgb() {
          return _index.default.runOnUI().RGB(color).string(false);
        },
        get rgba() {
          return _index.default.runOnUI().RGB(color).string(true);
        },
        get hsl() {
          return _index.default.runOnUI().HSL(color).string(false);
        },
        get hsla() {
          return _index.default.runOnUI().HSL(color).string(true);
        },
        get hsv() {
          return _index.default.runOnUI().HSV(color).string(false);
        },
        get hsva() {
          return _index.default.runOnUI().HSV(color).string(true);
        },
        get hwb() {
          return _index.default.runOnUI().HWB(color).string(false);
        },
        get hwba() {
          return _index.default.runOnUI().HWB(color).string(true);
        },
      };
    };
    const onGestureEnd = color => {
      'worklet';

      if (!onComplete && !onCompleteJS) return;
      const colorObject = returnedResults(color);
      if (onComplete) onComplete(colorObject);
      if (onCompleteJS) (0, _reactNativeReanimated.runOnJS)(onCompleteJS)(colorObject);
    };
    const onGestureChange = color => {
      'worklet';

      if (!onChange && !onChangeJS) return;
      const colorObject = returnedResults(color);
      if (onChange) onChange(colorObject);
      if (onChangeJS) (0, _reactNativeReanimated.runOnJS)(onChangeJS)(colorObject);
    };
    const setColor = (color, duration = thumbAnimationDuration) => {
      const { h, s, v, a } = _index.default.HSV(color).object(false);
      hueValue.value = (0, _reactNativeReanimated.withTiming)(h, {
        duration,
      });
      saturationValue.value = (0, _reactNativeReanimated.withTiming)(s, {
        duration,
      });
      brightnessValue.value = (0, _reactNativeReanimated.withTiming)(v, {
        duration,
      });
      alphaValue.value = (0, _reactNativeReanimated.withTiming)(a, {
        duration,
      });
    };
    (0, _react.useEffect)(() => {
      // Ignore value changes if the current color already matches the new color from the value props.
      const newColorFormat = _index.default.getFormat(value);
      const currentColors = returnedResults();

      // null or named color E.g "red"
      if (!newColorFormat || newColorFormat === 'named') {
        setColor(value);
        return;
      }

      // hex color
      if (newColorFormat === 'hex3' || newColorFormat === 'hex4' || newColorFormat === 'hex6' || newColorFormat === 'hex8') {
        if (value !== currentColors.hex) setColor(value);
        return;
      }

      // hsl | hsla | rgb | rgba | hsva | hsv | hwba | hwb
      if (newColorFormat in currentColors) {
        if (value !== currentColors[newColorFormat]) setColor(value);
        return;
      }
      setColor(value);
    }, [value]);
    (0, _react.useImperativeHandle)(ref, () => ({
      setColor,
    }));
    const ctxValue = {
      hueValue,
      saturationValue,
      brightnessValue,
      alphaValue,
      adaptSpectrum,
      sliderThickness,
      thumbSize,
      thumbShape,
      boundedThumb,
      thumbColor,
      renderThumb,
      thumbStyle,
      thumbInnerStyle,
      thumbScaleAnimationValue,
      thumbScaleAnimationDuration,
      value,
      setColor,
      returnedResults,
      onGestureEnd,
      onGestureChange,
    };
    return /*#__PURE__*/ _react.default.createElement(
      _reactNativeGestureHandler.GestureHandlerRootView,
      {
        style: [
          {
            direction: _utils.isWeb ? 'ltr' : undefined,
          },
          style,
        ],
      },
      /*#__PURE__*/ _react.default.createElement(
        _AppContext.PickerContextProvider,
        {
          value: ctxValue,
        },
        children,
      ),
    );
  },
);
var _default = (exports.default = ColorPicker);
