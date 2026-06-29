## Icon System

The application uses **Tabler Icons** for all iconography to maintain a consistent, modern, and minimal design language.

### Why Tabler Icons?
- **Consistency:** Provides a uniform set of stroke-based icons.
- **Maintainability:** Minimalist and clean aesthetic, well-suited for our design system.
- **Customizability:** Allows fine-grained control over stroke weight and size.

### How to use
Import the `Icon` component from `src/components/ui/Icon` and pass the specific icon component from `tabler-icons-react-native`.

```tsx
import { Icon } from '../components/ui/Icon';
import { Calendar } from 'tabler-icons-react-native';

<Icon name={Calendar} size={24} stroke={1.5} />
```

### Design Rules
- **Stroke:** Default `1.5`.
- **Size:** Default `24`.
- **Color:** Always use the theme-aware colors from `ThemeContext` via the `Icon` component wrapper.
- **Style:** Use only outline icons; do not use filled variants.
