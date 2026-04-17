export const MESSAGES = {
  // Auth
  NETWORK_ERROR: "Network error. Check your connection and try again.",
  LOGIN_FAILED: "Login failed. Please try again.",
  REGISTRATION_FAILED: "Registration failed. Please try again.",
  SESSION_EXPIRED: "Your session has expired. Please log in again.",

  // Validation
  FILL_ALL_FIELDS: "Please fill in all required fields.",
  INVALID_EMAIL: "Please enter a valid email address.",
  PASSWORD_TOO_SHORT: "Password must be at least 9 characters.",
  PASSWORD_TOO_LONG: "Password must be no more than 64 characters.",
  PASSWORD_NEEDS_NUMBER: "Password must contain at least one number.",
  PASSWORD_NEEDS_UPPERCASE: "Password must contain at least one uppercase letter.",
  PASSWORD_NEEDS_LOWERCASE: "Password must contain at least one lowercase letter.",
  PASSWORD_NEEDS_SPECIAL: "Password must contain at least one special character.",
  PASSWORDS_DO_NOT_MATCH: "Passwords do not match.",

  // Generic
  LOAD_FAILED: "Failed to load data. Please try again.",
  SAVE_FAILED: "Failed to save changes. Please try again.",
  DELETE_FAILED: "Failed to delete. Please try again.",
  SEND_FAILED: "Failed to send. Please try again.",
  NO_RECIPIENTS: "No recipients found for the selected audience.",
} as const;
