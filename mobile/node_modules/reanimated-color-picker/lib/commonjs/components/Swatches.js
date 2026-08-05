'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.Swatches = Swatches;
var _react = _interopRequireDefault(require('react'));
var _reactNative = require('react-native');
var _AppContext = _interopRequireDefault(require('../AppContext'));
var _styles = require('../styles');
function _interopRequireDefault(e) {
  return e && e.__esModule ? e : { default: e };
}
const SWATCHES_COLORS = [
  '#f44336',
  '#E91E63',
  '#9C27B0',
  '#673AB7',
  '#3F51B5',
  '#2196F3',
  '#03A9F4',
  '#00BCD4',
  '#009688',
  '#4CAF50',
  '#8BC34A',
  '#CDDC39',
  '#FFEB3B',
  '#FFC107',
  '#FF9800',
  '#FF5722',
  '#795548',
  '#9E9E9E',
  '#607D8B',
];
function Swatches({ colors = SWATCHES_COLORS, style = {}, swatchStyle = {} }) {
  const { setColor, onGestureChange, onGestureEnd } = (0, _AppContext.default)();
  const onPress = swatch => {
    setColor(swatch);
    onGestureChange(swatch);
    onGestureEnd(swatch);
  };
  return /*#__PURE__*/ _react.default.createElement(
    _reactNative.View,
    {
      style: [_styles.styles.swatchesContainer, style],
    },
    colors.map((swatch, i) =>
      /*#__PURE__*/ _react.default.createElement(_reactNative.Pressable, {
        key: swatch + i,
        onPress: () => onPress(swatch),
        style: [
          _styles.styles.swatch,
          swatchStyle,
          {
            backgroundColor: swatch,
          },
        ],
        accessibilityLabel: `Select color: ${swatch}`,
        accessibilityRole: 'button',
      }),
    ),
  );
}
