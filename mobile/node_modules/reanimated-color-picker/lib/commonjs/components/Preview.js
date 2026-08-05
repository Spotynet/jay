'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.Preview = Preview;
var _react = _interopRequireWildcard(require('react'));
var _reactNative = require('react-native');
var _reactNativeReanimated = _interopRequireWildcard(require('react-native-reanimated'));
var _index = _interopRequireDefault(require('../colorKit/index'));
var _AppContext = _interopRequireDefault(require('../AppContext'));
var _styles = require('../styles');
var _utils = require('../utils');
var _PreviewText = require('./PreviewText');
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
function Preview({
  style = {},
  textStyle = {},
  colorFormat = 'hex',
  hideInitialColor = false,
  hideText = false,
  disableOpacityTexture = false,
}) {
  const { hueValue, saturationValue, brightnessValue, alphaValue, returnedResults, value } = (0, _AppContext.default)();
  const justifyContent = (0, _utils.getStyle)(style, 'justifyContent') ?? 'center';
  const [initialValueFormatted, setInitialValueFormatted] = (0, _react.useState)('');
  (0, _react.useEffect)(() => {
    setInitialValueFormatted(returnedResults()[colorFormat]);
  }, [value, colorFormat]);
  const initialColorText = (0, _reactNativeReanimated.useDerivedValue)(() => {
    const adaptiveTextColor =
      alphaValue.value > 0.5
        ? value
        : {
            h: 0,
            s: 0,
            v: 70,
          };
    const contrast = _index.default.runOnUI().contrastRatio(adaptiveTextColor, '#ffffff');
    return contrast < 4.5 ? '#000000' : '#ffffff';
  }, [alphaValue, value]);
  const textColor = (0, _reactNativeReanimated.useSharedValue)('#ffffff');
  const textColorStyle = (0, _reactNativeReanimated.useAnimatedStyle)(
    () => ({
      color: textColor.value,
    }),
    [textColor],
  );
  const previewColor = (0, _reactNativeReanimated.useSharedValue)('#ffffff');
  const previewColorStyle = (0, _reactNativeReanimated.useAnimatedStyle)(
    () => ({
      backgroundColor: previewColor.value,
    }),
    [previewColor],
  );

  // When the values of channels change
  (0, _reactNativeReanimated.useDerivedValue)(() => {
    const currentColor = {
      h: hueValue.value,
      s: saturationValue.value,
      v: brightnessValue.value,
      a: alphaValue.value,
    };
    previewColor.value = _index.default.runOnUI().HEX({
      h: hueValue.value,
      s: saturationValue.value,
      v: brightnessValue.value,
      a: alphaValue.value,
    });

    // calculate the contrast ratio
    const compareColor1 =
      alphaValue.value > 0.5
        ? currentColor
        : {
            h: 0,
            s: 0,
            v: 70,
          };
    const compareColor2 =
      textColor.value === '#000000'
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
    const reversedColor = textColor.value === '#ffffff' ? '#000000' : '#ffffff';
    textColor.value = contrast < 4.5 ? reversedColor : textColor.value;
  }, [hueValue, saturationValue, brightnessValue, alphaValue]);
  return /*#__PURE__*/ _react.default.createElement(
    Wrapper,
    {
      disableTexture: disableOpacityTexture,
      style: style,
    },
    /*#__PURE__*/ _react.default.createElement(
      _utils.ConditionalRendering,
      {
        if: !hideInitialColor,
      },
      /*#__PURE__*/ _react.default.createElement(
        _reactNative.View,
        {
          style: [
            _styles.styles.previewContainer,
            {
              backgroundColor: value,
              justifyContent,
            },
          ],
        },
        /*#__PURE__*/ _react.default.createElement(
          _utils.ConditionalRendering,
          {
            if: !hideText,
          },
          /*#__PURE__*/ _react.default.createElement(
            _reactNativeReanimated.default.Text,
            {
              style: [
                _styles.styles.previewText,
                {
                  color: initialColorText,
                },
                textStyle,
              ],
            },
            initialValueFormatted,
          ),
        ),
      ),
    ),
    /*#__PURE__*/ _react.default.createElement(
      _reactNativeReanimated.default.View,
      {
        style: [
          _styles.styles.previewContainer,
          {
            justifyContent,
          },
          previewColorStyle,
        ],
      },
      /*#__PURE__*/ _react.default.createElement(
        _utils.ConditionalRendering,
        {
          if: !hideText,
        },
        /*#__PURE__*/ _react.default.createElement(_PreviewText.PreviewText, {
          colorFormat: colorFormat,
          style: [textStyle, textColorStyle],
        }),
      ),
    ),
  );
}
function Wrapper({ children, disableTexture, style }) {
  if (disableTexture) {
    return /*#__PURE__*/ _react.default.createElement(
      _reactNative.View,
      {
        style: [_styles.styles.previewWrapper, style],
      },
      children,
    );
  }
  if (_utils.isWeb) {
    return /*#__PURE__*/ _react.default.createElement(
      _reactNative.View,
      {
        style: [_styles.styles.previewWrapper, previewWrapperWebStyle, style],
      },
      children,
    );
  }
  return /*#__PURE__*/ _react.default.createElement(
    _reactNative.ImageBackground,
    {
      source: require('../assets/transparent-texture.png'),
      imageStyle: {
        width: '100%',
        height: '100%',
      },
      resizeMode: 'repeat',
      style: [_styles.styles.previewWrapper, style],
    },
    children,
  );
}
const previewWrapperWebStyle = {
  backgroundImage:
    'repeating-linear-gradient(45deg, #c1c1c1 25%, transparent 25%, transparent 75%, #c1c1c1 75%, #c1c1c1), repeating-linear-gradient(45deg, #c1c1c1 25%, #fff 25%, #fff 75%, #c1c1c1 75%, #c1c1c1)',
  backgroundPosition: '0px 0px, 8px 8px',
  backgroundSize: '16px 16px',
};
