# Jay Mobile — Development notes

**Authoritative policy:** repo-root [`AGENTS.md`](../../AGENTS.md)  
**Architecture map:** [`architecture.md`](architecture.md)  
**Theme tokens:** [`THEME_GUIDE.md`](THEME_GUIDE.md) and `src/context/ThemeContext.tsx`

This file is a short working checklist for day-to-day mobile work. Prefer the
documents above when anything conflicts.

## Stack reminders

- Expo app (not Expo Router). Routes are registered in `src/navigation/AppNavigator.tsx`.
- Native bottom tabs on iOS/Android; JS `TabBar` on web.
- Inspect `package.json` versions before adopting APIs. No SDK upgrades or new
  native modules without approval.

## Everyday patterns

- Screens: `ScreenLayout` or `FormScreen` (pinned submit footer for editors).
- Colors: `useTheme()` → `colors.surface` (not `colors.card`), `colors.text`, etc.
- Icons: Tabler via `components/ui/Icon`.
- Feature UI: keep under `screens/<feature>/` or `components/<feature>/`.
- Overlays / timeline scroll clearance above the tab bar:
  `layout/useFloatingChromeBottom` + `scrollContentBottomClearance` — do not
  hardcode tab-bar height or double safe-area padding.

## Checks

```bash
# Colocated unit-style asserts (no Jest project config yet)
npx --yes tsx src/layout/tabBarClearance.test.ts

# Typecheck (many pre-existing errors may appear outside your change)
npx tsc --noEmit
```

Distinguish **source checks**, **Expo Go**, and **native-build / device**
verification in any report. Do not claim Liquid Glass or native chrome was
verified from a JS-only preview.
