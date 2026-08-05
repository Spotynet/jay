import React, { useState } from 'react';
import { View, StyleSheet, TextInput, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import ScreenLayout from '../../components/common/ScreenLayout';
import { AppText } from '../../components/ui/AppText';
import { Icon } from '../../components/ui/Icon';
import { createCategory, updateCategory, deleteCategory } from '../../api/finance';
import { AuthButton } from '../auth/components/AuthButton';
import { IconTag, IconTrendingUp, IconTrendingDown, IconTrash } from 'tabler-icons-react-native';
import DeleteConfirm from '../../components/ui/DeleteConfirm';

export default function CategoryEntryScreen() {
  const { colors, entityColors } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const category = route.params?.category;

  const [name, setName] = useState(category?.name || '');
  const [type, setType] = useState<'EXPENSE' | 'EARNING'>(category?.type || 'EXPENSE');
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const saveCategory = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    setLoading(true);
    try {
      const data = { name: name.trim(), type };
      if (category) {
        await updateCategory(category.id, data);
      } else {
        await createCategory(data);
      }
      Alert.alert('Success', 'Category saved');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!category) return;
    setLoading(true);
    try {
      await deleteCategory(category.id);
      Alert.alert('Deleted', 'Category removed');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Failed to delete');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <ScreenLayout
      title={category ? 'EDIT CATEGORY' : 'NEW CATEGORY'}
      showBack={true}
      rightOption={
        category
          ? {
              render: () => (
                <TouchableOpacity onPress={() => setShowDeleteConfirm(true)} style={styles.headerBtn}>
                  <Icon name={IconTrash} size={20} color={colors.error} />
                </TouchableOpacity>
              ),
            }
          : undefined
      }
    >
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <AppText style={[styles.sectionLabel, { color: colors.subtext }]}>CATEGORY DETAILS</AppText>

          <View style={[styles.iconSection, { backgroundColor: `${entityColors.finance}14` }]}>
            <Icon name={IconTag} size={32} color={entityColors.finance} />
          </View>

          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceElevated }]}
            placeholder="Category name"
            placeholderTextColor={colors.subtext}
            value={name}
            onChangeText={setName}
          />

          <View>
            <AppText style={[styles.fieldLabel, { color: colors.subtext }]}>TYPE</AppText>
            <View style={styles.typeRow}>
              {([
                { value: 'EXPENSE', label: 'Expense', icon: IconTrendingDown, color: '#FF3B30' },
                { value: 'EARNING', label: 'Income', icon: IconTrendingUp, color: '#34C759' },
              ] as const).map((opt) => {
                const isSelected = type === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => setType(opt.value)}
                    activeOpacity={0.8}
                    style={[
                      styles.typeOption,
                      {
                        backgroundColor: isSelected ? `${opt.color}12` : colors.surfaceElevated,
                        borderColor: isSelected ? opt.color : colors.border,
                      },
                    ]}
                  >
                    <View style={[styles.typeIconWrap, { backgroundColor: isSelected ? `${opt.color}18` : colors.surface }]}>
                      <Icon name={opt.icon} size={18} color={isSelected ? opt.color : colors.subtext} />
                    </View>
                    <AppText bold style={[styles.typeLabel, { color: isSelected ? opt.color : colors.text }]}>
                      {opt.label}
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        <AuthButton title={category ? 'Update Category' : 'Create Category'} onPress={saveCategory} loading={loading} />

        <DeleteConfirm visible={showDeleteConfirm} onCancel={() => setShowDeleteConfirm(false)} onConfirm={handleDelete} />
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  headerBtn: { padding: 8 },
  container: { paddingVertical: 20, gap: 16 },
  section: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 16,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  iconSection: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  typeIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeLabel: {
    fontSize: 15,
  },
});
