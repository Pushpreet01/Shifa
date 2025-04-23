// utils/dateUtils.ts

/**
 * Normalizes a date by setting the time to 00:00:00.000
 * Useful for date comparisons without time
 */
export const normalizeDate = (date: Date): Date => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  };
  
  /**
   * Checks if a date is in the past (before today)
   * @param date The date to check
   * @returns true if the date is before today, false otherwise
   */
  export const isDateInPast = (date: Date): boolean => {
    const today = normalizeDate(new Date());
    const normalizedDate = normalizeDate(date);
    return normalizedDate < today;
  };
  
  /**
   * Checks if a date is today or in the future (not in the past)
   * @param date The date to check
   * @returns true if the date is today or in the future, false if it's in the past
   */
  export const isDateValidForEvent = (date: Date): boolean => {
    return !isDateInPast(date);
  };
  
  /**
   * Formats a date as YYYY-MM-DD
   */
  export const formatDateISO = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  /**
   * Formats a date in a friendly format
   */
  export const formatDateFriendly = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };