import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, TextInput, TouchableWithoutFeedback } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { AppText } from '../../../components/ui/AppText';
import Animated, { useAnimatedStyle, withTiming, withSequence, withSpring } from 'react-native-reanimated';

interface CodeInputProps {
  code: string;
  setCode: (code: string) => void;
  length?: number;
}

export const CodeInput = ({ code, setCode, length = 6 }: CodeInputProps) => {
  const { colors } = useTheme();
  const inputRef = useRef<TextInput>(null);

  const digits = Array.from({ length }, (_, i) => code[i] || '');

  return (
    <TouchableWithoutFeedback onPress={() => inputRef.current?.focus()}>
      <View style={styles.container}>
        <TextInput
          ref={inputRef}
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
          maxLength={length}
          style={styles.hiddenInput}
        />
        <View style={styles.digitsContainer}>
          {digits.map((digit, index) => (
            <Animated.View 
              key={index} 
              style={[
                styles.digitBox, 
                { 
                  backgroundColor: colors.card, 
                  borderColor: code.length === index ? colors.accent : colors.border 
                }
              ]}
            >
              <AppText style={[styles.digitText, { color: colors.text }]}>{digit}</AppText>
            </Animated.View>
          ))}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center', marginVertical: 10 },
  hiddenInput: { position: 'absolute', opacity: 0 },
  digitsContainer: { flexDirection: 'row', gap: 12 },
  digitBox: { width: 45, height: 60, borderRadius: 16, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  digitText: { fontSize: 24, fontWeight: '800' }
});
