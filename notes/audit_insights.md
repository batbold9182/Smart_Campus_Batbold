## Backend Fix Log

| # | File(s) | What changed |
|---|---------|--------------|
| 1 | `server.js` | Startup guard: `process.exit(1)` if `JWT_SECRET` missing or < 32 chars |
| 2 | `authRoutes.js` | OTP hashed with `bcrypt.hash(otp, 10)`; reset-password uses `bcrypt.compare()` |
| 3 | `lunchBuddySocket.js`, `learningBuddySocket.js`, `partyBuddySocket.js` | `xss` package installed; inbound message text sanitized before DB write and broadcast |
| 4 | `assignmentRoutes.js` | Submission download access check uses `mongoose.Types.ObjectId.equals()` instead of string comparison |
| 5 | `middleware/errorHandler.js` | Duplicate key → 409; Mongo network/timeout errors → 503; 4xx = `warn`, 5xx = `error` + stack |
| 6 | `models/adminModels/user.js` | Added indexes: `{ email: 1 }`, `{ role: 1 }` |
| 6 | `models/adminModels/notification.js` | Added compound index: `{ recipient: 1, isRead: 1, createdAt: -1 }` |
| 6 | `models/adminModels/schedule.js` | Added index: `{ day: 1, startTime: 1 }` |
| 7 | `server.js` | `http://` origins filtered from `allowedOrigins` when `NODE_ENV=production` |
| 8 | `routes/adminRoutes/adminRoutes.js` | `page`/`limit` parsing: `parseInt(x, 10)` with `Math.max`/`Math.min` bounds |
| 9 | `routes/adminRoutes/adminEnrollRoutes.js` | DELETE unenroll returns `204 No Content` |
| 10 | `routes/studentRoutes/libraryRoutes.js` | Validates `Content-Type: application/json` from OpenLibrary; `response.json()` wrapped in try/catch → 502 on malformed data |
| 11 | `server.js` | Added `GET /health` → `{ status: "ok", timestamp }` |
| 12 | `routes/authRoutes.js` | **[B-C1]** Login JWT now uses `process.env.JWT_EXPIRES_IN \|\| "7d"` instead of `RESET_TOKEN_TTL_MINUTES` |
| 13 | `routes/adminRoutes/adminNotificationRoutes.js` | **[B-C2]** `express-validator` checks added: `title` (max 200), `message` (max 2000). `recipients` validated as ObjectIds and resolved against `User` before `insertMany` |
| 14 | `models/adminModels/user.js` | **[B-H1]** `email` field now has `sparse: true` — prevents duplicate-key error on multiple null emails |
| 15 | `server.js` | **[B-H2]** `SIGTERM`/`SIGINT` handlers: `server.close()` then `mongoose.connection.close()` for graceful shutdown |
| 16 | `routes/adminRoutes/adminEnrollRoutes.js` | **[B-H3]** `Enrollment.create` + `notification.create` wrapped in `session.withTransaction()` |
| 17 | `routes/facultyRoutes/assignmentRoutes.js` | **[B-H3]** `Assignment.create` + `Notification.insertMany` wrapped in a session transaction |
| 18 | `routes/facultyRoutes/attendanceRoutes.js` | **[B-H3]** Attendance upsert + notification wrapped in `session.withTransaction()` |
| 19 | `routes/adminRoutes/adminRoutes.js` | **[B-H4]** `GET /admin/users` pagination returns `{ page, limit, total, totalPages }`; `PATCH /admin/users/:id` strips password from response DTO |
| 20 | `routes/authRoutes.js` | **[B-M1]** `otpLimiter` added (max 5 per 15 min, keyed by `req.body.email \|\| req.ip`) on `/forgot-password` and `/reset-password` |
| 21 | `routes/studentRoutes/buddyRoutes/*.js`, `routes/facultyRoutes/gradeRoutes.js` | **[B-M6]** Buddy message routes: cursor-based pagination (`?before=<id>&limit=`); grade history: `?page=&limit=` with `pagination` envelope |
| 22 | `routes/authRoutes.js`, `routes/facultyRoutes/assignmentRoutes.js`, `routes/studentRoutes/libraryRoutes.js`, `server.js` | **[B-M4]** Hardcoded values moved to env vars: `RESET_TOKEN_TTL_MINUTES`, `MAX_UPLOAD_BYTES`, `OPEN_LIBRARY_TIMEOUT_MS`, `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX` |
| 23 | `models/adminModels/schedule.js`, `models/facultyModels/assignment.js`, `models/facultyModels/attendance.js`, `models/adminModels/grade.js` | **[B-L6]** Schema validators: `Schedule` `startTime < endTime`; `Assignment.dueDate` future-only; `Attendance.date` no future dates; `Grade.value` range enforced in update route |
| 24 | `models/adminModels/schedule.js` | **[B-M3]** Composite unique index `{ course: 1, faculty: 1, day: 1, startTime: 1 }` added |
| 25 | `server.js` | **[B-M2]** Helmet configured with `crossOriginResourcePolicy: { policy: "cross-origin" }` and `referrerPolicy: { policy: "strict-origin-when-cross-origin" }` |
| 26 | `server.js` | **[B-L2]** `GET /ready` returns `503` when `mongoose.connection.readyState !== 1` |
| 27 | `server.js` | **[B-L3]** Request ID middleware added before route mounting: `req.id = crypto.randomUUID()` |

## Frontend Fix log

| # | File(s) | What changed |
|---|---------|--------------|
| 1 | `services/tokenStorage.ts` | `expo-secure-store` installed; uses `SecureStore` on native, falls back to `AsyncStorage` on web |
| 2 | `components/ErrorBoundary.tsx` *(new)*, `app/_layout.tsx` | Class-based `<ErrorBoundary>` with reload button; wraps `<InnerLayout>`; stack trace only logged in `__DEV__` |
| 3 | `app/admin/dashboard.tsx`, `app/admin/create-user.tsx`, `app/student/schedule.tsx` | Each async `useEffect` now creates an `AbortController`, passes `signal` to the service, and aborts on cleanup |
| 3a | `services/notificationService.ts`, `services/scheduleService.ts`, `services/adminServices/adminService.ts` | Added optional `signal?: AbortSignal` param to `getUnreadCount`, `getStudentSchedule`, `getAdminSchedules`, `getAcademicOptions` |
| 4 | `app/auth/forgot-password.tsx` | OTP block guarded by `__DEV__ && devOtp`; label reads "Development OTP (dev build only)" |
| 5 | `config/clientAPI.ts` | Response interceptor attaches `error.friendlyMessage`: 403 → permission denied, 404 → not found, 5xx → server error |
| 6 | `app/admin/dashboard.tsx` | Replaced direct `api.get("/api/admin/schedules")` with `getAdminSchedules()` from `scheduleService.ts` |
| 7 | `app/student/schedule.tsx` | Added `error` state; network failure shows an error message instead of empty screen |
| 8 | `app/index.tsx` | **[F-C1]** `AppState.addEventListener("change", ...)` added — on `"active"` transition, re-checks token expiry and redirects to login if expired |
| 9 | `config/clientAPI.ts`, `app/auth/login.tsx` | **[F-C2]** 401 interceptor redirects to `/auth/login?reason=expired`; login screen shows "Your session has expired. Please log in again." inline message |
| 10 | `app/admin/users.tsx`, `app/student/schedule.tsx`, `app/faculty/courses.tsx`, `app/admin/create-course.tsx` | **[F-H5]** `SkeletonList` + empty-state added to `admin/users.tsx`; `student/schedule.tsx` upgraded with retry + improved empty state; `faculty/courses.tsx` error state + retry added |
| 11 | `app/faculty/courses.tsx` | **[F-H3]** `loadCourses()` wrapped in try/catch; `error` state and retry button added |
| 12 | `components/LiveClock.tsx` *(new)*, `app/admin/dashboard.tsx` | **[F-M3]** 1-second `setInterval` clock extracted to `LiveClock.tsx`; dashboard no longer re-renders every second |
| 13 | `app/admin/notifications.tsx`, `app/student/partyBuddy.tsx`, `app/admin/create-user.tsx` | **[F-M6]** HTML stripped from notification title/message and partyBuddy emit; email regex check added to `create-user.tsx` |
| 14 | `frontend/types/api.ts` *(new)* | **[F-H4]** `UserProfile`, `ScheduleItem`, `Assignment`, `Grade`, `NotificationItem`, `Course` interfaces; service return types annotated |
| 15 | `frontend/constants/app.ts`, `frontend/constants/api.ts`, `frontend/constants/messages.ts` *(new)* | **[F-M7]** `APP_NAME`/`APP_TAGLINE`; `NOTIFICATIONS_LIMIT`, `BUDDY_MESSAGE_MAX_LENGTH`, MIME types; user-facing strings normalised |
| 16 | `app/admin/notifications.tsx`, `app/admin/create-course.tsx` | **[F-H2]** Direct `api.get()` calls replaced with `notificationService` and `courseService`/`adminService` functions |
| 17 | `frontend/contexts/AuthContext.tsx` *(new)*, `app/_layout.tsx` | **[F-H1]** `AuthContext` created; exposes `useAuth()` → `{ user, refreshUser, signOut }`; root layout wrapped in `<AuthProvider>` |
| 18 | `frontend/app/_layout.tsx` | **[F-M1 partial]** `<Toast />` from `react-native-toast-message` added to root layout |
| 19 | `frontend/utils/logger.ts` *(new)* | **[F-M5 partial]** `logger.log/warn/error` utility created, gated on `__DEV__`; call-sites still to be migrated |
| 20 | `server.js`|added max age |
| 21 | `cloudinary.js`|changed cleanupError to cleanupError.message so that config  object into log lines never spread
| 22 | `socketRateLimit.js` *(new)* | shared ip connection and shared them across socket files 
