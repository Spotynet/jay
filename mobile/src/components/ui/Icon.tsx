import React from 'react';
import { Icon as TablerIcon, IconProps as TablerIconProps } from 'tabler-icons-react-native';
import { useTheme } from '../../context/ThemeContext';

interface IconProps extends Omit<TablerIconProps, 'color'> {
  name: React.FC<TablerIconProps> | any;
  color?: string;
}

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
    <IconComponent 
      size={size} 
      stroke={stroke} 
      color={color || colors.text} 
      {...safeProps} 
    />
  );
};
