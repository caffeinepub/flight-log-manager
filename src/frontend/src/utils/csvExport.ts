import type { FlightLog } from "../backend";
import { formatDuration } from "./timeUtils";

/**
 * Export flight logs to CSV format
 * @param logs - Array of flight logs
 * @param filename - Filename for the download
 */
export function exportToCSV(logs: FlightLog[], filename: string = "flight_logs.csv"): void {
  if (logs.length === 0) {
    alert("No data to export");
    return;
  }

  // CSV headers
  const headers = [
    "Date",
    "Student",
    "Instructor",
    "Aircraft",
    "Type",
    "Exercise",
    "Takeoff",
    "Landing",
    "Duration",
    "Landing Type",
    "Landing Count",
  ];

  // Convert logs to CSV rows
  const rows = logs.map((log) => [
    log.date,
    log.studentName,
    log.instructorName,
    log.aircraftRegistration,
    log.flightType,
    log.exerciseName,
    log.takeoffTime,
    log.landingTime,
    formatDuration(log.durationMinutes),
    log.landingType,
    log.landingCount.toString(),
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
