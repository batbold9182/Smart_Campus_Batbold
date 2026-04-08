# Backend
1. Add memory caching to reduce server load. starting from april
2. Clean up routes make file structure clean - 80% to 90% i guess
# Frontend
1. After wiring everything with the backend fully upgrade UI/UX.
2. start design on figma will make it ready on april 10th - 15th

## Remaining Performance Items
- [ ] **Cache lifetimes** (save ~1,495 KiB) — add `Cache-Control: public, max-age=31536000, immutable` for `_expo/static/` assets at deploy level (Vercel/Nginx/Cloudflare)
- [ ] **Image delivery** (save ~1,167 KiB) — convert PNG/JPG assets to WebP, use `expo-image` with explicit width/height, serve responsive sizes
- [ ] **Unused JS** (~210 KiB) — mostly react-native-web internals; `react-native-reanimated` is required by expo-router/react-navigation for screen transitions so it cannot be safely removed
- [ ] **Forced reflow** — audit scrollToEnd / layout reads in buddy screens; batch DOM reads before writes
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
- [ ] **Unify two theme systems** — currently `theme.ts` (StyleSheet.create pages) and `tailwind.config.js` (NativeWind pages) define overlapping tokens separately; merge into a single source of truth
- [ ] **Dark mode for all NativeWind pages** — the StyleSheet pages support dark/light via ThemeContext, but NativeWind pages (auth, admin CRUD, faculty, student) are light-only; wire `dark:` variants using NativeWind's `darkMode: 'class'` support
- [ ] **Haptic / micro-interaction feedback** — add `expo-haptics` for button presses, form submissions, and toggle actions
- [ ] **Design system component library** — extract reusable Button, Card, Input, Badge, Modal components with theme-aware defaults to reduce duplication across ~30 screens
- [ ] **Animated theme transition** — smooth colour interpolation when toggling dark/light instead of instant swap

## Try to check security such as NOSQL and SQL injection etc