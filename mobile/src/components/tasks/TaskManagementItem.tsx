import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { AppText } from '../ui/AppText';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

interface TaskManagementItemProps {
  name: string;
  metadata: string;
  category?: string;
  isCompleted: boolean;
  onToggle: () => void;
  onPress: () => void;
  onDelete: () => void;
}

export const TaskManagementItem = ({ name, metadata, category, isCompleted, onToggle, onPress, onDelete }: TaskManagementItemProps) => {
  const { colors, accentColor } = useTheme();
  
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const [date, time] = metadata.split(' ');
  const formattedMetadata = time ? `${date} • ${time}` : date;

  return (
    <Animated.View style={[styles.wrapper, animatedStyle]}>
      <TouchableOpacity 
        style={[styles.container, { backgroundColor: colors.surface }]} 
        onPress={onPress} 
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
      >
        <TouchableOpacity style={[styles.checkbox, { borderColor: isCompleted ? accentColor : colors.border, backgroundColor: isCompleted ? accentColor : 'transparent' }]} onPress={onToggle}>
            {isCompleted && <Ionicons name="checkmark" size={16} color="white" />}
        </TouchableOpacity>
        <View style={styles.content}>
          <AppText style={[styles.title, { color: colors.text, textDecorationLine: isCompleted ? 'line-through' : 'none', opacity: isCompleted ? 0.6 : 1 }]} numberOfLines={1}>{name}</AppText>
          <View style={styles.row}>
            {category && <AppText style={[styles.category, { color: accentColor }]}>{category} • </AppText>}
            <AppText style={[styles.metadata, { color: colors.subtext }]}>{formattedMetadata}</AppText>
          </View>
        </View>
        <TouchableOpacity onPress={onDelete} style={styles.actionButton} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="trash-outline" size={20} color={colors.subtext} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginHorizontal: 20 },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  checkbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, marginRight: 16, justifyContent: 'center', alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center' },
  content: { flex: 1, gap: 2 },
  title: { fontSize: 16, fontWeight: '600' },
  category: { fontSize: 13, fontWeight: '600', marginRight: 4 },
  metadata: { fontSize: 13, lineHeight: 18, letterSpacing: 0.2 },
  actionButton: { padding: 4, marginLeft: 16 },
});
