// Smart timezone utilities with automatic detection

export const IST_TIMEZONE = 'Asia/Kolkata';
export const IST_OFFSET = '+05:30';

/**
 * Get user's current timezone
 */
export function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return IST_TIMEZONE; // Fallback to IST
  }
}

/**
 * Get timezone abbreviation from timezone string
 */
export function getTimezoneAbbreviation(timezone: string): string {
  try {
    const date = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'short'
    });
    const parts = formatter.formatToParts(date);
    const timeZonePart = parts.find(part => part.type === 'timeZoneName');
    return timeZonePart?.value || timezone;
  } catch {
    return timezone;
  }
}

/**
 * Format a timestamp to user's local timezone
 */
export function formatToLocalTime(timestamp: string | Date): string {
  const date = new Date(timestamp);
  const userTimezone = getUserTimezone();
  
  return date.toLocaleString('en-US', {
    timeZone: userTimezone,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Format time only to user's local timezone
 */
export function formatTimeToLocal(timestamp: string | Date): string {
  const date = new Date(timestamp);
  const userTimezone = getUserTimezone();
  
  return date.toLocaleTimeString('en-US', {
    timeZone: userTimezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Format date and time with timezone indicator
 */
export function formatWithTimezone(timestamp: string | Date, includeTimezone: boolean = true): string {
  const userTimezone = getUserTimezone();
  const formatted = formatToLocalTime(timestamp);
  
  if (!includeTimezone) return formatted;
  
  const tzAbbr = getTimezoneAbbreviation(userTimezone);
  return `${formatted} ${tzAbbr}`;
}

/**
 * Get user's timezone display
 */
export function getTimezoneDisplay(): string {
  const userTimezone = getUserTimezone();
  const tzAbbr = getTimezoneAbbreviation(userTimezone);
  
  try {
    const date = new Date();
    const offset = date.toLocaleString('en-US', {
      timeZone: userTimezone,
      timeZoneName: 'longOffset'
    }).split(' ').pop();
    
    return `${tzAbbr} (${offset})`;
  } catch {
    return tzAbbr;
  }
}

/**
 * Format for chart display (shorter format)
 */
export function formatForChart(timestamp: string | Date): string {
  const date = new Date(timestamp);
  const userTimezone = getUserTimezone();
  
  return date.toLocaleString('en-US', {
    timeZone: userTimezone,
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

// Legacy IST functions for backward compatibility
export const formatToIST = formatToLocalTime;
export const formatTimeToIST = formatTimeToLocal;