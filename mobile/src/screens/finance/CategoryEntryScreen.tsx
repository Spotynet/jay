import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import FormScreen from '../../components/common/FormScreen';
import { Icon } from '../../components/ui/Icon';
import Box from '../../components/ui/Box';
import Label from '../../components/ui/Label';
import Input from '../../components/ui/Input';
import IconCircle from '../../components/ui/IconCircle';
import ColorSwatchPicker, { DEFAULT_COLOR_PALETTE } from '../../components/ui/ColorSwatchPicker';
import { createCategory, updateCategory, deleteCategory } from '../../api/finance';
import { IconTrash } from 'tabler-icons-react-native';
import DeleteConfirm from '../../components/ui/DeleteConfirm';
import { IconPickerModal } from '../habits/components/IconPickerModal';
import { FINANCE_ICONS } from '../../constants/financeIcons';

export default function CategoryEntryScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const category = route.params?.category;

  const [name, setName] = useState(category?.name || '');
  const [iconName, setIconName] = useState(category?.icon || 'Wallet');
  const [color, setColor] = useState(category?.color || DEFAULT_COLOR_PALETTE[5]);
  const [description, setDescription] = useState(category?.description || '');
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const selectedIcon =
    FINANCE_ICONS.find((i) => i.name === iconName)?.icon || FINANCE_ICONS[0].icon;

  const saveCategory = async () => {
    if (!name.trim()) {
      setError('Enter a category name.');
      return;
    }
    setError(null);

    setLoading(true);
    try {
      const data = {
        name: name.trim(),
        type: category?.type || 'EXPENSE',
        budget: category?.budget != null ? parseFloat(category.budget) : 0,
        parent: null,
        icon: iconName,
        color,
        description: description.trim(),
      };
      if (category) {
        await updateCategory(category.id, data);
      } else {
        await createCategory(data);
      }
      navigation.goBack();
    } catch (e) {
      setError("Couldn't save this category.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!category) return;
    setLoading(true);
    try {
      await deleteCategory(category.id);
      navigation.goBack();
    } catch (e) {
      setShowDeleteConfirm(false);
      setError("Couldn't delete this category.");
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <FormScreen
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
      submitTitle={category ? 'Update Category' : 'Create Category'}
      onSubmit={saveCategory}
      loading={loading}
      error={error}
      scrollContentStyle={styles.container}
    >
      <IconPickerModal
        visible={showIconPicker}
        onClose={() => setShowIconPicker(false)}
        onSelect={setIconName}
        icons={FINANCE_ICONS}
      />

      <View style={styles.nameRow}>
        <IconCircle
          icon={selectedIcon}
          accentColor={color}
          onPress={() => setShowIconPicker(true)}
        />
        <Input
          style={styles.nameInput}
          placeholder="Category name"
          value={name}
          onChangeText={setName}
        />
      </View>

      <Label>COLOR</Label>
      <Box>
        <ColorSwatchPicker value={color} onChange={setColor} />
      </Box>

      <Label>DESCRIPTION</Label>
      <Box>
        <Input
          variant="plain"
          style={styles.descInput}
          placeholder="What belongs in this category? (optional)"
          value={description}
          onChangeText={setDescription}
          multiline
          textAlignVertical="top"
        />
      </Box>

      <DeleteConfirm visible={showDeleteConfirm} onCancel={() => setShowDeleteConfirm(false)} onConfirm={handleDelete} />
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  headerBtn: { padding: 8 },
  container: { gap: 16, paddingVertical: 20, alignItems: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 12, width: '100%' },
  nameInput: {
    flex: 1,
  },
  descInput: {
    minHeight: 90,
    padding: 0,
    fontSize: 15,
    fontWeight: '400',
  },
});