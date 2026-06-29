# Jay Mobile - Theme & Coloring Guide

This guide defines the dynamic coloring system used to maintain a consistent native look across iOS and Android, supporting both Light/Dark modes and user-defined Accent colors.

## 🎨 Theme Variables

Always consume these variables via the `useTheme()` hook. **Do not use hardcoded hex values** in components.

| Variable | Usage | Light Mode | Dark Mode |
| :--- | :--- | :--- | :--- |
| `colors.accent` | **Primary actions**, active icons, toggles, highlights. | *User Selected* | *User Selected* |
| `colors.background` | **Main screen** background. | `#F2F2F7` | `#000000` |
| `colors.card` | **Containers**, list items, modals, inputs, cards. | `#FFFFFF` | `#1C1C1E` |
| `colors.text` | **Primary text** and main titles. | `#000000` | `#FFFFFF` |
| `colors.subtext` | **Secondary text**, descriptions, labels, hints. | `#636366` | `#8E8E93` |
| `colors.border` | **Dividers**, borders, and thin lines. | `#C6C6C8` | `#38383A` |

## 🛠 Usage Example

```tsx
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function ExampleComponent() {
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Consistent Header</Text>
        <Text style={[styles.body, { color: colors.subtext }]}>This is secondary text.</Text>
        
        <TouchableOpacity style={[styles.button, { backgroundColor: colors.accent }]}>
          <Text style={styles.buttonText}>Primary Action</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: { padding: 16, borderRadius: 12, borderWidth: 1 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  body: { fontSize: 14, marginBottom: 16 },
  button: { padding: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: '600' }
});
```

## 📐 Design Rules

1. **Hierarchy**: Use `colors.background` for the base layer and `colors.card` for elevated elements (cards, inputs, list rows).
2. **Interactive Elements**: Use `colors.accent` to signify that an element is interactive or active (e.g., a selected tab or a primary "Save" button).
3. **Contrast**: Ensure text remains readable by using `colors.text` for content and `colors.subtext` only for non-essential information.
4. **Icons**:
   - **Active/Action**: Use `colors.accent`.
   - **Neutral/Static**: Use `colors.subtext` or `colors.text`.
5. **Borders**: Use `colors.border` for subtle separation. On high-resolution screens, a `borderWidth` of `0.5` or ` StyleSheet.hairlineWidth` is often preferred for a native feel.
