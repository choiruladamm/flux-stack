/**
 * Time conversion constants
 */
export const SECONDS_TO_MS = 1000;
export const MINUTES_TO_MS = 60 * SECONDS_TO_MS;
export const HOURS_TO_MS = 60 * MINUTES_TO_MS;
export const DAYS_TO_MS = 24 * HOURS_TO_MS;

/**
 * Common durations in milliseconds
 */
export const DURATION = {
  ONE_SECOND: 1 * SECONDS_TO_MS,
  FIVE_SECONDS: 5 * SECONDS_TO_MS,
  ONE_MINUTE: 1 * MINUTES_TO_MS,
  FIVE_MINUTES: 5 * MINUTES_TO_MS,
  FIFTEEN_MINUTES: 15 * MINUTES_TO_MS,
  ONE_HOUR: 1 * HOURS_TO_MS,
  ONE_DAY: 1 * DAYS_TO_MS,
  ONE_WEEK: 7 * DAYS_TO_MS,
} as const;
