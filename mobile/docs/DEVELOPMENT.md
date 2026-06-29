# Jay Mobile - AI Development Guide

This document defines the architecture, styling rules, and API patterns for the Jay Mobile application. All AI-generated code must strictly follow these standards.

## 🧱 Project Structure

The project is organized by **Feature**. Each feature has its own folder for screens and components.

### Directory Mapping
- `src/context/`: Global states (Theme, Auth).
- `src/screens/<feature>/`: Screen components organized by tab/feature.
- `src/components/common/`: Reusable global UI elements (Buttons, Cards, Modals).
- `src/components/<feature>/`: UI elements specific to a single feature.
- `src/api/`: API service layer and hooks.
- `src/hooks/`: Reusable business logic.
- `src/utils/`: Formatting and helper functions.

## 🎨 Theme & Styling Standards

The app uses a dynamic theme system. **Never hardcode hex colors**.

### 1. Using the Theme Hook
Always use the `useTheme` hook to access the current color palette and accent color.
```tsx
import { useTheme } from '../../context/ThemeContext';

const { colors, isDark } = useTheme();
```

### 2. Layout & Safe Area
Always use the `<ScreenLayout>` component as the root container for every screen to handle device safe-area insets (notch/dynamic island) automatically.
```tsx
import ScreenLayout from '../../components/common/ScreenLayout';

export default function MyScreen() {
  return (
    <ScreenLayout>
      {/* Screen content */}
    </ScreenLayout>
  );
}
```

### 3. Common Components
Always prefer using the reusable components in `src/components/common/`:
- `<Card />`: Standard themed container.
- `<Button />`: Themed button with `primary`, `secondary`, `outline`, and `danger` variants.

## 📡 API Integration

- **Base URL**: `${EXPO_PUBLIC_API_URL}`
- **Format**: `${EXPO_PUBLIC_API_URL}/api/<app_name>/`

## 🛠 Component Rules

- **Functional Components**: Use `export default function Name()`.
- **TypeScript**: Define Interfaces for all Props.
- **Icons**: Use `@expo/vector-icons` (Ionicons preferred).
- **Feedback**: Use `TouchableOpacity` for interactive elements.
