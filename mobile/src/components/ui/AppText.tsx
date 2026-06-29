import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';

export const AppText = ({ style, bold, ...props }: TextProps & { bold?: boolean }) => {
  return (
    <Text
      style={[styles.base, bold && styles.bold, style]}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  base: {
    fontFamily: 'Manrope_400Regular',
  },
  bold: {
    fontFamily: 'Manrope_800ExtraBold',
  },
});
