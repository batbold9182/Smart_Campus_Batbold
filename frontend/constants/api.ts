/** Default page size for notification feeds */
export const NOTIFICATIONS_LIMIT = 5;

/** Default page size for user lists */
export const USERS_PAGE_LIMIT = 5;

/** Maximum buddy chat message length (characters) */
export const BUDDY_MESSAGE_MAX_LENGTH = 400;

/** Maximum number of buddy messages to fetch per request */
export const BUDDY_MESSAGES_LIMIT = 50;

/**
 * Maximum assignment submission file size (bytes).
 * Mirrors the backend default in `assignmentRoutes.js`
 * (`Number(process.env.MAX_UPLOAD_BYTES) || 10 * 1024 * 1024`). Kept at the
 * default so the client cap is never above the server's limit.
 */
export const MAX_SUBMISSION_BYTES = 10 * 1024 * 1024;

/** Accepted MIME types for assignment file submissions */
export const ACCEPTED_SUBMISSION_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "text/plain",
] as const;
