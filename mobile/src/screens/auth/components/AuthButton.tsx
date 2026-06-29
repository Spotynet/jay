import React from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { AppText } from '../../../components/ui/AppText';
import { useTheme } from '../../../context/ThemeContext';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

export const AuthButton = ({ title, onPress, loading }: { title: string, onPress: () => void, loading?: boolean }) => {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity 
        onPressIn={() => scale.value = withSpring(0.97)}
        onPressOut={() => scale.value = withSpring(1)}
        onPress={onPress} 
        style={[styles.button, { backgroundColor: colors.accent }]}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <AppText style={styles.text}>{title}</AppText>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: { height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  text: { color: '#fff', fontSize: 16, fontWeight: '400', letterSpacing: 3 }
});
