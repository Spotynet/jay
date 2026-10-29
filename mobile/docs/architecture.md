# JAY Mobile — Architecture

Living map of the **actual** repository. Policy rules live in the repo-root
[`AGENTS.md`](../../AGENTS.md). Theme tokens: [`THEME_GUIDE.md`](THEME_GUIDE.md)
(prefer `colors.surface` — there is no `colors.card`).

---

## Repository shape

Monorepo:

| Path | Role |
|------|------|
| `backend/` | Django API (finance, habits, journal, tasks, events, planning, …) |
| `mobile/` | Expo React Native app (primary client) |
| `deploy/`, `docker/`, `nginx/` | Ops / containers |

Mobile is **not** Expo Router. Entry:

- `mobile/index.ts` → `App.tsx` → `RootProvider` + `AppNavigator`
- Navigation: React Navigation (`native-stack` + native bottom tabs on iOS/Android; JS `TabBar` on web)

Installed stack (verify in `mobile/package.json` before choosing APIs): Expo SDK 58, RN 0.88, React Navigation 7, `react-native-screens` ~4.30. No path aliases in `tsconfig` — relative imports.

---

## Routing

Defined imperatively in `src/navigation/AppNavigator.tsx`:

1. **Auth stack** — Login / Register / ForgotPassword when logged out
2. **Main** → stack wrapping tabs + modal/editor screens
3. **Tabs** (native on iOS/Android via `createNativeBottomTabNavigator`):
   Today · Plan · Journal · Financial · Review
4. Editors (journal/task/event/habit/finance/…) registered on the main stack as
   full-screen modals on iOS

Web uses the custom JS `navigation/components/TabBar.tsx`. Do not assume
`useBottomTabBarHeight` exists under native tabs — use
`layout/useFloatingChromeBottom` / `tabBarClearance` for overlays.

---

## Feature ownership (screens)

Screens live under `src/screens/<feature>/` (feature-oriented, not a flat dump):

| Feature folder | Owns |
|----------------|------|
| `today/` | Daily timeline home, create hub |
| `planning/` | Plan tab, project tasks |
| `journal/` | Daily journal + entry |
| `finance/` | Transactions / budget tabs + category/transaction editors |
| `review/` | Review tab (aggregates day/week signals) |
| `itemDetails/` | Full-screen timeline item details (MainStack modal, Profile pattern) |
| `habits/`, `tasks/`, `events/`, `projects/` | Entry / related editors |
| `manage/` | Systems + per-domain settings |
| `profile/` | Account, security, day setup, notifications |
| `auth/` | Auth screens + local auth chrome |
| `stats/` | Thin re-export → `review` (compat alias) |

Colocate feature-only UI under `screens/<feature>/components/` **or**
`components/<feature>/` when reused across screens. Prefer the feature that owns
the UX; promote to shared only when a second feature needs it.

---

## Shared UI vs platform UI

| Area | Path | Notes |
|------|------|--------|
| Shell / forms | `components/common/` | `ScreenLayout`, `FormScreen`, `AppHeader`, `ActionButton`, cards, pickers |
| Primitives | `components/ui/` | `AppText`, `Icon`, … |
| Timeline | `components/timeline/` | Agenda, cards, rings strip, below-pill |
| Item details | `components/itemDetails/` | Shared details grammar (see below) |
| Navigation | `navigation/` | Navigators, providers, web TabBar |
| Layout tokens | `layout/` | Responsive width, timeline tokens, tab-bar clearance |
| Theme | `context/ThemeContext.tsx` | Semantic colors / accent |

**Platform files** (Metro resolution) — use only when needed:

- `Component.ios.tsx` / `Component.android.tsx` / `Component.tsx` (fallback)
- Do not create all three by default
- Keep business logic out of platform files; keep props aligned
- Centralize capability checks (e.g. Reduce Transparency) rather than scattering
  version gates in every screen

Today’s platform split is mostly **navigator-level** (native tabs vs web TabBar),
not per-component `.ios` files.

---

## Data / state

| Concern | Location |
|---------|----------|
| Auth session | `store/authStore` + `context/AuthContext` |
| Theme | `context/ThemeContext` |
| Server data | `api/*` + TanStack Query (`RootProvider`) |
| Domain helpers | `utils/*` (dates, timeline layout, below-shortcut, day metrics) |
| Cross-cutting hooks | `hooks/` (e.g. unsaved-changes guard) |

Backend remains source of truth for persistence. Mobile does not own a second
offline domain model beyond auth/session caching already present.

---

## Layout & chrome utilities

- **Responsive:** `layout/responsive.ts` — window width → phone/tablet, content max width, padding. Use container/window layout; do not substitute physical screen size for measured width.
- **Timeline spacing:** `layout/useTimelineTokens.ts`
- **Tab-bar clearance for overlays:** `layout/tabBarClearance.ts` +
  `useFloatingChromeBottom` — measured parent vs safe-area; do not double-apply
  safe-area or invent bar height from a different navigator.
- **Safe area:** `SafeAreaProvider` at root; screen shells via `ScreenLayout` /
  form footer keyboard avoidance — audit before adding another bottom pad.

---

## Timeline item details — content standard

**Route:** `ItemDetails` on MainStack (same full-screen modal pattern as Profile).
**Do not** wrap details in a second modal. Header owns Close / Edit / overflow.

### Shared hierarchy (visual grammar)

1. **Identity** — `DetailsIdentity`: compact `[icon] title` (+ optional supporting
   text). Type lives in the nav title (`Habit` / `Task` / `Event`); do not repeat
   a body type label.
2. **Primary action** — `DetailsPrimaryAction` when the type supports an
   occurrence-scoped action (Habit complete/progress, Task complete). Events have
   none.
3. **Typed sections** — `DetailSection` + `DetailMetaRow` (label/value) for
   metadata; Notes only when content exists.
4. **Shell** — `ItemDetailsShell` is scroll + loading/error only. Feature logic and
   mutations stay in `screens/itemDetails/ItemDetailsScreen.tsx`; section markup in
   `typeBodies.tsx`.

### Optional sections

Omit empty optional fields (no “No time”, “No daily goal”, or blank Notes cards).
Do not style read-only rows like disabled inputs or add chevrons to non-interactive
rows. Content surfaces stay quiet (`colors.surface`) — no glass on metadata/notes.

### Type-specific notes

| Type | Identity icon | Primary action | Body |
|------|---------------|----------------|------|
| Habit | `HABIT_ICONS` (fallback `ENTITY_ICONS.habit`) | Occurrence complete or COUNT ± | Recent activity (7-day window), Schedule, Notes |
| Task | `ENTITY_ICONS.task` | Complete/undo for selected day context | Schedule rows only when due date/time/duration exist; Project; Notes |
| Event | `ENTITY_ICONS.event` | None | When (date/start/end-from-duration); Location; Notes |

Habit recent activity uses current recurrence only — historical schedule versions
are not stored. Tasks are not a recurring series model; `occurrenceDate` is timeline
context, distinct from `due_date` / `due_time`.

### Intentionally outside this standard

- **Journal** — `JournalEntryScreen` remains a writing/rating flow, not compact
  metadata rows.
- **Finance** — `TransactionDetail` and category flows keep their own receipt /
  budget chrome (see `AGENTS.md` Finance rules).

### Native chrome vs content

Nav chrome may use platform-native materials where supported. Details **content**
(identity, sections, notes, activity strip) must not claim glass.

---

## Naming conventions

- Screens: `*Screen.tsx` (default export common for navigators)
- Shared controls: PascalCase files matching the export
- Tests: colocated `*.test.ts` runnable with `npx --yes tsx <file>` (no Jest
  project config in mobile today)
- Icons: Tabler via `components/ui/Icon` (see former icon notes below)

---

## How to add…

### A screen

1. Add `src/screens/<feature>/MyScreen.tsx` using `ScreenLayout` or `FormScreen`.
2. Register the route in `AppNavigator.tsx` (tabs or stack).
3. Wire API via `src/api/<domain>.ts` + Query where appropriate.
4. Do not invent Expo Router file routes.

### A reusable component

1. Feature-only → `screens/<feature>/components/` or `components/<feature>/`.
2. App-wide chrome → `components/common/` or `components/ui/`.
3. Export only what callers need; avoid barrel files that re-export the world.

### A platform-specific control

1. Extract a shared props contract.
2. Add `MyControl.ios.tsx` (and/or `.android.tsx`) only if APIs diverge.
3. Keep a `.tsx` fallback when one platform can share implementation.
4. Document any native-build requirement in the PR/agent report.

---

## Icons

Tabler Icons via `src/components/ui/Icon` + `tabler-icons-react-native`.
Default stroke `1.5`, size `24`, theme colors through the wrapper. Outline only.

---

## Known debt & follow-ups (ordered)

1. **Docs vs code:** `DEVELOPMENT.md` previously claimed Ionicons / `colors.card`
   — treat `AGENTS.md` + this file + `ThemeContext` as authoritative.
2. **Optional `features/` migration:** Gradually colocate screen + feature
   components + feature hooks under `src/features/<name>/` *without* changing
   navigation registration in the same PR. High churn; do one feature at a time.
3. **`components/common` cleanup:** Move remaining feature-specific widgets out;
   delete confirmed-dead files (e.g. unused `AgendaCard` if still unreferenced).
4. **Platform wrappers:** Introduce `.ios` / `.android` only when a control needs
   genuine divergent native APIs (menus, glass, date pickers).
5. **`expo-glass-effect` / Expo UI:** Not installed — do not fake Liquid Glass;
   revisit only with approval (custom native build impact).
6. **Android native polish:** Separate pass after iOS chrome stabilizes — Material
   navigation/insets, no iOS glass port.
7. **Test runner:** Formalize `tsx` tests or add a real Jest/Expo config; many
   `tsc` errors exist outside the timeline/layout work and are pre-existing.

---

## Regression checklist (smoke)

When touching Today / navigation / layout:

- [ ] Native tabs still present on iOS/Android; web TabBar still works
- [ ] Today header profile / + / date selector
- [ ] Exact-minute sections + now marker
- [ ] Four rings strip + “No time” row snap/fades
- [ ] Below shortcut: visibility rules, dismiss, clears tab bar (~12pt gap)
- [ ] FormScreen save footer + unsaved guard
- [ ] Finance budget/transactions semantics unchanged
