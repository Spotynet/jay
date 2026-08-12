import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import FormScreen from '../../components/common/FormScreen';
import Label from '../../components/ui/Label';
import Input from '../../components/ui/Input';
import AmountInput from '../../components/ui/AmountInput';
import SelectPicker from '../../components/ui/SelectPicker';
import { Icon } from '../../components/ui/Icon';
import { createCategory, updateCategory, deleteCategory, getCategories } from '../../api/finance';
import { IconTag, IconTrash } from 'tabler-icons-react-native';
import DeleteConfirm from '../../components/ui/DeleteConfirm';

export default function CategoryItemEntryScreen() {
  const { colors, entityColors } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const item = route.params?.item;
  const preselectedParent = route.params?.parent;

  const [name, setName] = useState(item?.name || '');
  const [type, setType] = useState<'EXPENSE' | 'EARNING'>(item?.type || preselectedParent?.type || 'EXPENSE');
  const [budget, setBudget] = useState(
    item?.budget != null ? parseFloat(item.budget).toFixed(2) : '0.00'
  );
  const [parent, setParent] = useState<any>(preselectedParent || null);
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [showParentPicker, setShowParentPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const c = await getCategories();
        const list = Array.isArray(c) ? c : [];
        setAllCategories(list);
        if (item?.parent && !parent) {
          const match = list.find((x: any) => x.id === item.parent);
          if (match) {
            setParent(match);
            setType(match.type);
          }
        }
      } catch (err) {
        console.error('Failed to fetch categories', err);
      }
    };
    fetchData();
  }, []);

  const parentId = parent?.id || (item?.parent != null ? item.parent : null);

  const parentOptions = allCategories.filter((c: any) => {
    if (c.id === item?.id) return false;
    if (c.parent != null) return false;
    return true;
  });

  const saveItem = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter an item name');
      return;
    }
    if (!parentId) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    setLoading(true);
    try {
      const data = {
        name: name.trim(),
        type,
        budget: parseFloat(budget).toFixed(2),
        parent: parentId,
      };
      if (item) {
        await updateCategory(item.id, data);
      } else {
        await createCategory(data);
      }
      Alert.alert('Success', 'Item saved');
      navigation.goBack();
    } catch (e: any) {
      const msg = e?.message || 'Failed to save item';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!item) return;
    setLoading(true);
    try {
      await deleteCategory(item.id);
      Alert.alert('Deleted', 'Item removed');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Failed to delete');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <FormScreen
      title={item ? 'EDIT ITEM' : 'NEW ITEM'}
      showBack={true}
      rightOption={
        item
          ? {
              render: () => (
                <TouchableOpacity onPress={() => setShowDeleteConfirm(true)} style={styles.headerBtn}>
                  <Icon name={IconTrash} size={20} color={colors.error} />
                </TouchableOpacity>
              ),
            }
          : undefined
      }
      submitTitle={item ? 'Update Item' : 'Add Item'}
      onSubmit={saveItem}
      loading={loading}
      scrollContentStyle={styles.container}
    >
      <Label>CATEGORY</Label>
      <SelectPicker
        value={parent ? { id: parent.id, label: parent.name } : null}
        options={parentOptions.map((c: any) => ({
          id: c.id,
          label: c.name,
          tag: Array.isArray(c.children) && c.children.length > 0 ? 'GROUP' : undefined,
        }))}
        onSelect={(opt) => {
          const match = parentOptions.find((c: any) => c.id === opt.id);
          if (match) { setParent(match); setType(match.type); }
        }}
        placeholder="Select a category"
        isOpen={showParentPicker}
        onToggle={() => setShowParentPicker(!showParentPicker)}
      />

      <Label>NAME</Label>
      <Input
        placeholder="Item name"
        value={name}
        onChangeText={setName}
      />

      <Label>MONTHLY BUDGET</Label>
      <AmountInput value={budget} onChangeValue={setBudget} />

      <DeleteConfirm visible={showDeleteConfirm} onCancel={() => setShowDeleteConfirm(false)} onConfirm={handleDelete} />
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  headerBtn: { padding: 8 },
  container: { gap: 16, paddingVertical: 20, alignItems: 'center' },
});