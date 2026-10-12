# JAY — Project Rules

## Create/Edit Form Pages (mobile)
All create/edit (entry) forms must pin the submit button to the bottom of the screen,
never inside the scrollable content.

- **Use `mobile/src/components/common/FormScreen.tsx`** for every new create/edit screen.
  It wraps `ScreenLayout` + a scrollable body and renders a fixed footer with the submit
  button (keyboard-aware on iOS).
- Props: `title`, `showBack`, `rightOption`, `submitTitle`, `onSubmit`, `loading`,
  `submitStyle`, `scrollContentStyle`, `keyboardAvoiding`.
- Example:
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
- Do NOT put the save button inside the `ScrollView`. Modals (`DeleteConfirm`, pickers)
  may be rendered as children (they portal above the UI).

## Finance
- Quick entries (`FinanceEntry`) are deprecated — transactions are the only source of
  truth. Do not reintroduce entry CRUD.
- There is no separate `FinanceSettings` screen and **no Accounts** (model/screen/section
  removed). Finance is managed inline on the main `FinanceScreen`'s two tabs: the
  **Transactions** tab (transactions, income/expense summary) and the **Budget** tab (a
  half-gauge comparing spent against the total budget, plus Categories). There is no
  per-month budget model — the **total budget is the sum of each EXPENSE category's
  `budget` field** (a `DecimalField` on `Category`). The gauge's `spent` is the month's
  EXPENSE sum. When this month has income (EARNING transactions), the gauge status line
  shows **free to spend** (income − spent); otherwise it shows budget remaining (budget −
  spent). Each EXPENSE category row shows a `$spent / $budget` total and a thin progress
  bar (fill = `spent/budget`, red when over budget).
- Categories support a **2-layer hierarchy**: a `Category` has an optional `parent` FK
  (`related_name='children'`). Layer 1 = parent group (e.g. Subscriptions), layer 2 = tracked
  items (e.g. Disney+, Amazon Prime). Validation (in `CategorySerializer`): parent must have
  the same `type`, depth is capped at 2 (a parent with a parent is rejected), and a category
  can't be its own parent. **Budgets live on leaf categories** (children + standalone);
  a parent's displayed budget is the *sum of its children's* budgets, and the gauge's
  `totalBudget` is the sum of **leaf** EXPENSE budgets only (avoids double-counting). Deleting
  a category that still has children is rejected (backend 400; frontend disables swipe for
  parents with children). `is_default` (Free Spend) stays top-level.
- There are **two separate create/edit forms** for categories:
  - `CategoryEntry` (top-level **folder/group**): no parent field, no type picker, no budget —
    just an **icon picker** (habit-style `IconPickerModal` with `FINANCE_ICONS`) beside the name,
    a **color** swatch palette, and an optional **description**. `type` is fixed (`EXPENSE`) and
    `budget` stays `0`/unchanged. Use `CategoryEntryScreen.tsx`.
  - `CategoryItemEntry` (tracked budget item): pick parent category, name, budget; type inherits
    from the chosen parent. Keep `budget` here — budgets live on items only.
  - Category model also carries `icon` (string name), `color` (hex), `description` (text).
  - FinanceScreen's header `+` is tab-aware: on **Budget** it opens the reusable `CreateNewModal`
    hub (title "Creation Hub") with "New Category" / "New Item"; on **Transactions** it goes
    straight to `TransactionEntry`. Group rows also get an inline `+` to add an item under that
    group. Tapping a group row opens `CategoryEntry` (edit); tapping a child row opens
    `CategoryItemEntry`. Group rows render the category's chosen icon + color (children fall back
    to the parent's color).
- A **default "Free Spend" EXPENSE category** (`budget=0`, `is_default=True`) is auto-created
  per user on the first `GET categories/` call (lazy init in `CategoryViewSet.list`) for
  expenses not related to any budget item. It cannot be deleted (backend rejects it) and
  its `is_default` field is read-only in the API. Budget = 0 so it adds no gauge budget,
  but its spent amount still counts toward `periodExpenses`.
- Budgets, Categories and Transactions sections on `FinanceScreen` use the default
  `SectionCard` (neutral gray gradient — see Theme). Do not pass `accentColor`.

## Theme
- Theme color tokens live in `mobile/src/context/ThemeContext.tsx` (`colors`). Use them
  instead of hardcoding colors. `colors.card` does not exist (use `colors.surface`).
- Card style standard: cards render a neutral top-to-bottom gray gradient
  (`rgba(255,255,255,0.05)→0` dark / `rgba(0,0,0,0.04)→0` light), transparent background,
  `borderRadius: 12`, and a subtle border (`rgba(255,255,255,0.08)` dark /
  `rgba(0,0,0,0.06)` light). This is the default for `SectionCard` and common `Card`.
- Use `accentColor` on `SectionCard` only when a card is intentionally entity-tinted.

## Cursor Cloud specific instructions

- Backend is Django in `backend/` (virtualenv at `backend/venv`). Frontend is Expo in `mobile/`. `dev.sh` starts both with PM2: API on port 3012, Expo web on port 3011. The Cloud Agent start script starts local PostgreSQL 16, runs `manage.py migrate`, and launches those servers without PM2. Logs: `/tmp/jay-api.log` and `/tmp/jay-expo.log`.
- The committed `backend/.env` sets `DATABASE_URL` to a shared remote database. Export `DATABASE_URL=postgres://jay:jay@127.0.0.1:5432/jay` before any `manage.py` command. django-environ does not overwrite variables that are already set, so the local URL is used.
- The mobile app reads `EXPO_PUBLIC_API_URL` from `mobile/.env` (`https://jay-api-dev.spotynet.com`). Expo inlines env files and later files override `process.env`, so do not add `mobile/.env.development.local` and do not export a different `EXPO_PUBLIC_API_URL` when starting Expo.
- Metro is started with `CI=1`, so it does not watch for file changes. Restart the Expo process after frontend edits.
- `python manage.py test` currently runs 0 tests. A working API check is `POST /api/users/register/` followed by `POST /api/habits/habits/`.
