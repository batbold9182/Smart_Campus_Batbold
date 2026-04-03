# Backend
1. Add memory caching to reduce server load. starting from april
2. Chatbot for FAQ -> implemented
3. Clean up routes make file structure clean - 80% to 90% i guess
4. Upgrade reset-password send OTP or jwt token directlty into users mail. starting from april
# Frontend
1. After wiring everything with the backend fully upgrade UI/UX.
2. start design on figma will make it ready on april 10th - 15th
3. do test's and focus on performance lazy imports caching and disconnect sockets on page hide etc
4. production test 1.
JS execution time	2.7s	1.8s	-33%
Unused JavaScript	403 KiB	210 KiB	-48%
Main-thread work	3.8s	3.1s	-18%
Minify JavaScript	255 KiB warning	Gone	Fixed
Long tasks	12	11	-1

## Done (Apr 3)
- [x] Lazy imports: socket.io-client, expo-image-picker, expo-document-picker
- [x] Disconnect sockets on page hide + refetch last 100 messages on reconnect
- [x] Added `<title>` via app/+html.tsx
- [x] Fixed contrast ratio: #6b7280 → #4b5563 (text-app-muted) across 16 files

## Remaining Performance Items
- [ ] **Cache lifetimes** (save ~1,495 KiB) — add `Cache-Control: public, max-age=31536000, immutable` for `_expo/static/` assets at deploy level (Vercel/Nginx/Cloudflare)
- [ ] **Image delivery** (save ~1,167 KiB) — convert PNG/JPG assets to WebP, use `expo-image` with explicit width/height, serve responsive sizes
- [ ] **Unused JS** (~210 KiB) — mostly react-native-web internals; consider removing `react-native-reanimated` if not actively used (it's installed but no imports found)
- [ ] **Forced reflow** — audit scrollToEnd / layout reads in buddy screens; batch DOM reads before writes
- [ ] **CSP / HSTS / COOP / XFO headers** — configure at deploy level (reverse proxy or hosting platform)
- [ ] **Reduce long main-thread tasks** (11 found) — code-split heavy admin/faculty screens with React.lazy + Suspense