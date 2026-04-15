# Backend
1. Add memory caching to reduce server load. starting from april
2. Clean up routes make file structure clean - 80% to 90% i guess
# Frontend
1. After wiring everything with the backend fully upgrade UI/UX.
2. start design on figma will make it ready on april 10th - 15th

## Remaining Performance Items
- [x] **Cache lifetimes** (save ~1,495 KiB) — added `serve.json` with immutable cache for `_expo/static/` and `assets/`, no-cache for HTML
- [x] **Image delivery** (save ~1,167 KiB) — converted `Logo_VIZJA.png` to WebP (1,167→60 KB), added explicit dimensions to building map image
- [x] **Font display** (save ~160 ms) — added `font-display: swap` in `global.css`
- [x] **Forced reflow** — replaced `setTimeout` → `requestAnimationFrame` in all 4 chat screens (learningBuddy, partyBuddy, vizjaFriends, ChatBotScreen)
- [x] **LCP request discovery** — added `<link rel="preload">` for logo WebP in `+html.tsx`
- [x] **Network dependency tree** — added `<link rel="preconnect">` to API origin in `+html.tsx`
- [ ] **Unused JS** (~210 KiB) — mostly react-native-web internals; `react-native-reanimated` is required by expo-router/react-navigation for screen transitions so it cannot be safely removed
- [ ] **CSP / HSTS / COOP / XFO headers** — configure at deploy level (reverse proxy or hosting platform)
- [ ] **Reduce long main-thread tasks** (11 found) — code-split heavy admin/faculty screens with React.lazy + Suspense

## Style — Medium Effort - done
- [x] **Entrance animations** — add fade-in / slide-up on screen mount using `Animated` API or `react-native-reanimated` (already installed)
    *Entrance animations student: grades, attendance, assignments, profile · faculty: grades, attendance, assignments, profile · admin: profile*
- [x] **Gradient headers on more screens** — extend `LinearGradient` header pattern (used in dashboards) to profile, assignments, attendance screens
    *Gradient headers Same 9 screens above — all now have LinearGradient blue→purple header matching dashboard pattern*
- [x] **Consistent card elevation** — standardise shadow/elevation values across all card components (currently mixed between `shadow-md`, `shadow-lg`, inline `elevation`)
    *Consistent shadow-card	tailwind.config.js (added card-sm, card-md, card-lg tokens) · all shadow" → shadow-card" in grades, attendance, assignments, onlineLibrary (student + faculty)*
- [x] **Responsive breakpoints** — use `useWindowDimensions` to adjust grid columns and font sizes on tablet/desktop (currently only buildingMap uses `isWide`)
    *Responsive hook Created and wired into student/grades (available for other screens to import)*
- [x] **Loading skeleton screens** — replace `ActivityIndicator` spinners with shimmer/skeleton placeholders for perceived performance
    *Skeleton loading Replaced ActivityIndicator full-screen spinners with skeleton placeholders in all 9 screens + notificationFeed.tsx + admin/enroll.tsx + admin/notifications.tsx + student/onlineLibrary.tsx*

## Style — Bigger Lifts
- [x] **Unify two theme systems** — previously `theme.ts` and `tailwind.config.js` defined overlapping tokens separately; now both import from `styles/tokens.js` (single source of truth with palette, semantic dark/light mappings, and Tailwind colour map)
- [x] **Dark mode for all NativeWind pages** — added CSS custom property tokens in `global.css` (`:root` / `.dark`), switched Tailwind colour config to `var()` references with `darkMode: 'class'`, and wrapped root layout in a `dark`-class-toggling View; all NativeWind pages now auto-switch dark/light with zero per-file changes
- [x] **Haptic / micro-interaction feedback** — created `utils/haptics.ts` wrapper around `expo-haptics`; wired selection haptic into ThemeContext `toggleTheme`, success/error haptics into login & register form handlers, light tap into all 3 dashboard quick-action cards, medium tap into logout buttons
- [x] **Design system component library** — created `components/ui/` with theme-aware `AppButton` (primary/danger/outline/ghost + haptics + loading), `AppCard` (elevated/bordered/flat), `AppInput` (consistent styling), `AppBadge` (success/error/warning/info/neutral pills), `AppModal` (bottom/center layouts); barrel export via `components/ui/index.ts`
- [x] **Animated theme transition** — created `ThemeTransitionOverlay` using `react-native-reanimated`; renders a full-screen overlay of the old theme's background that fades out over 400 ms with cubic easing, placed in root `_layout.tsx` after the Stack navigator

## Migrate Screens to Design System (`components/ui/`)
*27 of 35 screens adopted — remaining 8 are dashboards, re-exports, or notification wrappers that don't benefit from migration*

### Auth (4/4 done)
- [x] **login.tsx** — AppButton, AppInput, AppCard
- [x] **register.tsx** — AppButton, AppInput, AppCard
- [x] **forgot-password.tsx** — AppButton, AppInput, AppCard
- [x] **reset-password.tsx** — AppButton, AppInput, AppCard

### Admin (7/11 done — 4 skipped)
- [x] **create-user.tsx** — AppButton, AppInput, AppModal
- [x] **create-course.tsx** — AppButton, AppInput, AppCard
- [x] **create-schedule.tsx** — AppButton, AppInput, AppModal, AppCard
- [x] **assignSchedule.tsx** — AppButton, AppCard, AppModal
- [x] **enroll.tsx** — AppButton, AppCard, AppModal
- [x] **users.tsx** — AppButton, AppCard, AppInput, AppModal
- [x] **notifications.tsx** — AppButton, AppCard, AppInput, AppModal
- [ ] ~~**schedule.tsx**~~ — placeholder screen, no migration needed
- [ ] ~~**dashboard.tsx**~~ — uses getDashboardStyles/StyleSheet pattern (shared across roles)
- [ ] ~~**profile.tsx**~~ — uses inline styles with ThemeContext tokens
- [ ] ~~**chatBot.tsx**~~ — re-exports ChatBotScreen component

### Student (6/12 done — 6 skipped/deferred)
- [x] **learningBuddy.tsx** — AppButton, AppInput (chat screen)
- [x] **partyBuddy.tsx** — AppButton, AppInput (chat screen)
- [x] **vizjaFriends.tsx** — AppButton, AppInput (chat screen)
- [x] **attendance.tsx** — AppButton, AppInput
- [x] **assignments.tsx** — AppButton, AppInput
- [x] **onlineLibrary.tsx** — AppButton, AppInput
- [ ] ~~**notifications.tsx**~~ — wrapper passing studentStyles to NotificationFeed
- [ ] ~~**dashboard.tsx**~~ — uses getDashboardStyles/StyleSheet pattern
- [ ] ~~**chatBot.tsx / buildingMap.tsx**~~ — re-exports shared components
- [ ] ~~**create-meeting.tsx**~~ — placeholder screen
- [ ] ~~**schedule.tsx / grades.tsx / profile.tsx**~~ — TouchableOpacity-only, lower priority

### Faculty (6/8 done — 2 skipped)
- [x] **assignments.tsx** — AppButton, AppInput (6 inputs, 5 buttons migrated)
- [x] **attendance.tsx** — AppButton, AppInput (2 inputs, 2 buttons migrated)
- [x] **grades.tsx** — AppButton, AppInput (2 inputs, 2 buttons migrated)
- [x] **courses.tsx** — AppButton
- [x] **exam.tsx** — AppButton
- [x] **profile.tsx** — AppButton (theme toggle icon kept as TouchableOpacity)
- [ ] ~~**notifications.tsx**~~ — wrapper passing facultyStyles to NotificationFeed
- [ ] ~~**dashboard.tsx**~~ — uses getDashboardStyles/StyleSheet pattern

## Security & Backend Upgrades

### Critical
- [x] **OTP exposed in response body** — OTP now logged server-side only, never sent in response
- [x] **CORS `origin: "*"`** — replaced with `ALLOWED_ORIGINS` env whitelist for both Express and Socket.IO
- [x] **Add `helmet` middleware** — `helmet()` added to `server.js` before CORS
- [x] **No input validation** — added `express-validator` schemas on all auth endpoints + reusable `validate` middleware
- [x] **No rate limiting** — added `express-rate-limit`: auth 15 req/15 min, API 100 req/15 min

### High
- [x] **JWT 7-day expiry** — too long for access tokens; implement short-lived (15 min) + refresh token flow
        *authRoutes.js line 79 expiresIn:"7d" to { expiresIn: `${RESET_TOKEN_TTL_MINUTES}m`}*
- [ ] **No frontend response interceptor** — `clientAPI.ts` missing 401 auto-logout / token refresh
- [ ] **`err.message` leaked to client** — all catch blocks expose internal errors; add global error handler middleware
- [ ] **DB connection no retry** — `db.js` calls `process.exit(1)` on first failure; add retry loop
- [ ] **No `compression` middleware** — JSON payloads sent uncompressed

### Medium
- [ ] **Add `.lean()` to read-only Mongoose queries** — scattered across all route files
- [ ] **Socket reconnection limits** — add `reconnectionDelay`, `reconnectionDelayMax`, `reconnectionAttempts`
- [X] **Weak password policy** — 6-char minimum, no complexity; raise to 12+ with mixed requirements
        *register.tsx line 33-55 reset-password line 36-52*
- [ ] **Input max-length missing** — names/emails have no upper bound
- [ ] **RBAC inconsistency** — some admin routes check role inline vs middleware; standardise with `authorizeRoles()` middleware

### Nice-to-have
- [ ] **Request logging** — add `morgan` for audit trails
- [ ] **API documentation** — Swagger/OpenAPI for backend routes
- [ ] **Backend TypeScript** — frontend is TS, backend is JS; inconsistent type safety