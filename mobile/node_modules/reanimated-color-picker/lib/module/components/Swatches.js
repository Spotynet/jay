import React from 'react';
import { Pressable, View } from 'react-native';
import usePickerContext from '../AppContext';
import { styles } from '../styles';
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
export function Swatches({ colors = SWATCHES_COLORS, style = {}, swatchStyle = {} }) {
  const { setColor, onGestureChange, onGestureEnd } = usePickerContext();
  const onPress = swatch => {
    setColor(swatch);
    onGestureChange(swatch);
    onGestureEnd(swatch);
  };
  return /*#__PURE__*/ React.createElement(
    View,
    {
      style: [styles.swatchesContainer, style],
    },
    colors.map((swatch, i) =>
      /*#__PURE__*/ React.createElement(Pressable, {
        key: swatch + i,
        onPress: () => onPress(swatch),
        style: [
          styles.swatch,
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
