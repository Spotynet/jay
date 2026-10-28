import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface IconProps {
  name: React.FC<any> | any;
  size?: number;
  stroke?: number;
  color?: string;
  [key: string]: any;
}

/**
 * Tabler icons are SVG. On native iOS they can expand and break row layouts unless
 * constrained to an explicit box. Keep the graphic centered in `size`×`size`.
 */
export const Icon: React.FC<IconProps> = ({
  name: IconComponent,
  size = 24,
  stroke = 1.5,
  color,
  ...props
}) => {
  const { colors } = useTheme();

  // Filter all props to exclude any that contain 'class' or 'Class' in the key
  const safeProps = Object.keys(props).reduce((acc, key) => {
    if (!/class/i.test(key)) {
      acc[key] = (props as any)[key];
    }
    return acc;
  }, {} as any);

  if (!IconComponent) return null;

  return (
    <View
      style={[styles.box, { width: size, height: size }]}
      pointerEvents="none"
      collapsable={false}
    >
      <IconComponent
        size={size}
        stroke={stroke}
        color={color || colors.text}
        {...safeProps}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
