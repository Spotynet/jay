# JAY — Project Rules

Coding agents must follow this file. Architecture details live in
[`mobile/docs/architecture.md`](mobile/docs/architecture.md) — link it; do not
duplicate the full map here.

---

## Native-first UI policy

JAY should feel native to the platform on which it runs.

- **iOS is the current implementation priority** (physical device / Expo Go).
- Prefer genuine supported **native** navigation, toolbars, menus, alerts,
  pickers, and presentation patterns for the installed Expo / React Navigation /
  React Native versions.
- Use native **Liquid Glass** only where the installed stack supports it and only
  for navigation or floating chrome — never claim BlurView / stacked gradients
  are Liquid Glass.
- Do **not** apply glass indiscriminately to content surfaces (timeline cards,
  ring cards, habit trackers, manage cards, form fields, etc.).
- Preserve compact, readable layouts and restrained visual hierarchy.
- **Explicitly approved custom designs** override the native-first default for
  that area (e.g. Manage-screen styling, timeline content chrome).
- Preserve accessibility and functional fallbacks on older supported OS versions.
- Prefer React Native `StyleSheet` layout for critical primitives over
  browser-only CSS.
- Do not treat a web preview as proof that native layout or materials work.
- Keep Expo Go testable — do not add native modules that require a custom build
  unless the user approves.

## Android direction

- Future Android UI should follow **native Android** conventions where
  appropriate — not a copy of iOS glass, SF Symbols, or iOS navigation geometry.
- Share product behavior and domain logic across platforms.
- Separate platform presentation only where genuine platform differences require
  it (see `.ios.tsx` / `.android.tsx` conventions in the architecture doc).
- Do not implement speculative Android-only features unless asked.
- Do not break existing Android compatibility while prioritizing iOS.

## Implementation discipline

- Inspect **installed** package versions before choosing APIs.
- Do **not** upgrade the SDK, add dependencies, or migrate navigation without
  explicit approval.
- Preserve data semantics, accessibility, navigation, and existing functionality
  during visual changes.
- Distinguish in reports: source/unit checks vs Expo Go vs native-build / device
  verification.
- Never claim native appearance was verified when it was not.

## Create/Edit Form Pages (mobile)

Default create/edit forms pin Save to the bottom of the screen, never inside the
scrollable content.

- **Use `mobile/src/components/common/FormScreen.tsx`** for every new create/edit
  screen. It wraps `ScreenLayout` + a scrollable body and, by default, a fixed
  footer with the submit button (keyboard-aware on iOS).
- Props: `title`, `showBack`, `rightOption`, `submitTitle`, `onSubmit`, `loading`,
  `submitStyle`, `scrollContentStyle`, `keyboardAvoiding`,
  `submitPlacement` (`'footer'` default | `'header'` opt-in Cancel/Save chrome).
- Example (footer Save — default):
  ```tsx
  <FormScreen
    title="NEW THING"
    showBack
    submitTitle="Save Thing"
    onSubmit={handleSave}
    loading={saving}
  >
    ...fields...
  </FormScreen>
  ```
- Opt-in header actions (Habit editor and similar details counterparts):
  `submitPlacement="header"` with `cancelLabel` / header Save — do **not** also
  keep a footer Save. Defaults remain footer for all other forms.
- Do NOT put the save button inside the `ScrollView`. Modals (`DeleteConfirm`,
  pickers) may be rendered as children (they portal above the UI).

## Finance

- Quick entries (`FinanceEntry`) are deprecated — transactions are the only
  source of truth. Do not reintroduce entry CRUD.
- There is no separate `FinanceSettings` screen and **no Accounts**
  (model/screen/section removed). Finance is managed inline on the main
  `FinanceScreen`'s two tabs: the **Transactions** tab (transactions,
  income/expense summary) and the **Budget** tab (a half-gauge comparing spent
  against the total budget, plus Categories). There is no per-month budget model
  — the **total budget is the sum of each EXPENSE category's `budget` field**
  (a `DecimalField` on `Category`). The gauge's `spent` is the month's EXPENSE
  sum. When this month has income (EARNING transactions), the gauge status line
  shows **free to spend** (income − spent); otherwise it shows budget remaining
  (budget − spent). Each EXPENSE category row shows a `$spent / $budget` total
  and a thin progress bar (fill = `spent/budget`, red when over budget).
- Categories support a **2-layer hierarchy**: a `Category` has an optional
  `parent` FK (`related_name='children'`). Layer 1 = parent group
  (e.g. Subscriptions), layer 2 = tracked items (e.g. Disney+, Amazon Prime).
  Validation (in `CategorySerializer`): parent must have the same `type`, depth
  is capped at 2 (a parent with a parent is rejected), and a category can't be
  its own parent. **Budgets live on leaf categories** (children + standalone);
  a parent's displayed budget is the *sum of its children's* budgets, and the
  gauge's `totalBudget` is the sum of **leaf** EXPENSE budgets only (avoids
  double-counting). Deleting a category that still has children is rejected
  (backend 400; frontend disables swipe for parents with children). `is_default`
  (Free Spend) stays top-level.
- There are **two separate create/edit forms** for categories:
  - `CategoryEntry` (top-level **folder/group**): no parent field, no type
    picker, no budget — just an **icon picker** (habit-style `IconPickerModal`
    with `FINANCE_ICONS`) beside the name, a **color** swatch palette, and an
    optional **description**. `type` is fixed (`EXPENSE`) and `budget` stays
    `0`/unchanged. Use `CategoryEntryScreen.tsx`.
  - `CategoryItemEntry` (tracked budget item): pick parent category, name,
    budget; type inherits from the chosen parent. Keep `budget` here — budgets
    live on items only.
  - Category model also carries `icon` (string name), `color` (hex),
    `description` (text).
  - FinanceScreen's header `+` is tab-aware: on **Budget** it opens the reusable
    `CreateNewModal` hub (title "Creation Hub") with "New Category" / "New Item";
    on **Transactions** it goes straight to `TransactionEntry`. Group rows also
    get an inline `+` to add an item under that group. Tapping a group row opens
    `CategoryEntry` (edit); tapping a child row opens `CategoryItemEntry`. Group
    rows render the category's chosen icon + color (children fall back to the
    parent's color).
- A **default "Free Spend" EXPENSE category** (`budget=0`, `is_default=True`) is
  auto-created per user on the first `GET categories/` call (lazy init in
  `CategoryViewSet.list`) for expenses not related to any budget item. It cannot
  be deleted (backend rejects it) and its `is_default` field is read-only in the
  API. Budget = 0 so it adds no gauge budget, but its spent amount still counts
  toward `periodExpenses`.
- Budgets, Categories and Transactions sections on `FinanceScreen` use the
  default `SectionCard` (neutral gray gradient — see Theme). Do not pass
  `accentColor`.

## Theme

- Theme color tokens live in `mobile/src/context/ThemeContext.tsx` (`colors`).
  Use them instead of hardcoding colors. `colors.card` does not exist (use
  `colors.surface`).
- Card style standard: cards render a neutral top-to-bottom gray gradient
  (`rgba(255,255,255,0.05)→0` dark / `rgba(0,0,0,0.04)→0` light), transparent
  background, `borderRadius: 12`, and a subtle border (`rgba(255,255,255,0.08)`
  dark / `rgba(0,0,0,0.06)` light). This is the default for `SectionCard` and
  common `Card`.
- Use `accentColor` on `SectionCard` only when a card is intentionally
  entity-tinted.

## Regression-sensitive surfaces

Do not redesign or regress without an explicit request:

- Native tab navigation and header actions
- Exact-minute timeline sections and current-time positioning
- Circular rings / shared ring container and completion math
- “No time” horizontal row (snap, fades, motion)
- Viewport-aware “below” shortcut and its clearance above the native tab bar
- Custom Manage-screen styling
- Data persistence, deep links, nested navigation

## Editor / prompt workflow

Standing product and domain rules in this file plus
[`mobile/docs/architecture.md`](mobile/docs/architecture.md) are the source of
truth. Feature prompts refine a specific surface; they do not replace these
policies unless they explicitly override a named area.
