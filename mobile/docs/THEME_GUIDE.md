# Jay Mobile - Theme & Coloring Guide

Dynamic coloring for light/dark modes and user accent. **Policy:** repo-root
[`AGENTS.md`](../../AGENTS.md). **Source of truth for keys:**
`src/context/ThemeContext.tsx` (if this table drifts, trust the code).

Always use `useTheme()`. **Do not hardcode hex values.**

## Theme variables

| Variable | Usage |
| :--- | :--- |
| `colors.accent` | Primary actions, active icons, toggles, highlights (user-selected). |
| `colors.background` | Main screen background. |
| `colors.surface` | Containers, list items, modals, inputs, cards. **There is no `colors.card`.** |
| `colors.surfaceElevated` | Slightly raised chrome / Reduce Transparency fallbacks. |
| `colors.text` | Primary text and titles. |
| `colors.subtext` | Secondary text, labels, hints. |
| `colors.border` | Dividers and thin lines. |

## 🛠 Usage Example

```tsx
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function ExampleComponent() {
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
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

1. **Hierarchy**: Use `colors.background` for the base layer and `colors.surface` for elevated elements (cards, inputs, list rows).
2. **Interactive Elements**: Use `colors.accent` to signify that an element is interactive or active (e.g., a selected tab or a primary "Save" button).
3. **Contrast**: Ensure text remains readable by using `colors.text` for content and `colors.subtext` only for non-essential information.
4. **Icons**:
   - **Active/Action**: Use `colors.accent`.
   - **Neutral/Static**: Use `colors.subtext` or `colors.text`.
5. **Borders**: Use `colors.border` for subtle separation. On high-resolution screens, a `borderWidth` of `0.5` or ` StyleSheet.hairlineWidth` is often preferred for a native feel.
