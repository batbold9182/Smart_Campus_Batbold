/**
 * Normalise a date-like value to midnight UTC on that calendar day.
 * Falls back to today when no value is supplied.
 * Returns null if the value cannot be parsed.
 *
 * @param {Date|string|number|null|undefined} dateValue
 * @returns {Date|null}
 */
const toStartOfDay = (dateValue) => {
  const parsed = dateValue ? new Date(dateValue) : new Date();
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return new Date(
    Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate())
  );
};

/**
 * Format a date-like value as a YYYY-MM-DD string (UTC calendar day).
 * Returns an empty string if the value cannot be parsed.
 *
 * @param {Date|string|number} dateValue
 * @returns {string}
 */
const formatDateKey = (dateValue) => {
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }
  const year = parsed.getUTCFullYear();
  const month = String(parsed.getUTCMonth() + 1).padStart(2, "0");
  const day = String(parsed.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

module.exports = { toStartOfDay, formatDateKey };
