import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { AppText } from '../ui/AppText';
import { Icon } from '../ui/Icon';
import { IconBook, IconEdit, IconPlus } from 'tabler-icons-react-native';

interface JournalFooterProps {
  entry: any;
  onAdd: () => void;
  onPress: () => void;
}

export const JournalFooter = ({ entry, onAdd, onPress }: JournalFooterProps) => {
  const { colors, entityColors } = useTheme();
  const journalColor = entityColors.journal;

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {entry ? (
        <TouchableOpacity style={styles.content} onPress={onPress} activeOpacity={0.7}>
          <View style={styles.iconBox}>
            <Icon name={IconBook} size={20} color={journalColor} />
          </View>
          <View style={styles.textContainer}>
            <AppText style={[styles.title, { color: colors.text }]}>Daily Reflection</AppText>
            <AppText style={[styles.summary, { color: colors.subtext }]} numberOfLines={1}>
              {entry.highlight}
            </AppText>
          </View>
          <Icon name={IconEdit} size={18} color={colors.subtext} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.content} onPress={onAdd} activeOpacity={0.7}>
          <View style={styles.iconBox}>
            <Icon name={IconPlus} size={20} color={colors.subtext} />
          </View>
          <AppText style={[styles.emptyText, { color: colors.subtext }]}>Add journal entry</AppText>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  summary: { fontSize: 13 },
  emptyText: { fontSize: 15, fontWeight: '500' },
});
