/**
 * Calculate duration in minutes from HH:MM times
 * @param takeoff - Takeoff time in HH:MM format
 * @param landing - Landing time in HH:MM format
 * @returns Duration in minutes
 */
export function calculateDuration(takeoff: string, landing: string): number {
  const [takeoffHours, takeoffMinutes] = takeoff.split(":").map(Number);
  const [landingHours, landingMinutes] = landing.split(":").map(Number);

  const takeoffTotalMinutes = takeoffHours * 60 + takeoffMinutes;
  const landingTotalMinutes = landingHours * 60 + landingMinutes;

  return landingTotalMinutes - takeoffTotalMinutes;
}

/**
 * Format minutes to HH:MM format
 * @param minutes - Duration in minutes
 * @returns Formatted duration as HH:MM
 */
export function formatDuration(minutes: number | bigint): string {
  const mins = typeof minutes === "bigint" ? Number(minutes) : minutes;
  const hours = Math.floor(mins / 60);
  const remainingMinutes = mins % 60;
  return `${hours}:${remainingMinutes.toString().padStart(2, "0")}`;
}

/**
 * Format minutes to decimal hours
 * @param minutes - Duration in minutes
 * @returns Decimal hours (e.g., 1.5 for 90 minutes)
 */
export function minutesToDecimalHours(minutes: number | bigint): number {
  const mins = typeof minutes === "bigint" ? Number(minutes) : minutes;
  return Math.round((mins / 60) * 100) / 100;
}

/**
 * Get current date in YYYY-MM-DD format
 */
export function getCurrentDate(): string {
  const now = new Date();
  return now.toISOString().split("T")[0];
}

/**
 * Get current month in YYYY-MM format
 */
export function getCurrentMonth(): string {
  const now = new Date();
  return now.toISOString().slice(0, 7);
}

/**
 * Format date for display (e.g., "Feb 24, 2026")
 */
export function formatDateDisplay(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Validate HH:MM time format
 */
export function isValidTime(time: string): boolean {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
}

/**
 * Validate YYYY-MM-DD date format
 */
export function isValidDate(date: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  return dateRegex.test(date);
}

/**
 * Validate YYYY-MM month format
 */
export function isValidMonth(month: string): boolean {
  const monthRegex = /^\d{4}-\d{2}$/;
  return monthRegex.test(month);
}
