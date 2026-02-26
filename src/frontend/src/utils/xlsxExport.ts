import * as XLSX from "xlsx";
import type { FlightLog, Student, Instructor, Aircraft, Exercise } from "../backend";
import { formatDuration } from "./timeUtils";

// ─── Flight Logs ─────────────────────────────────────────────────────────────

/**
 * Export flight logs to a single-sheet Excel (.xlsx) file and trigger download.
 */
export function exportFlightLogsToExcel(
  logs: FlightLog[],
  filename: string = `flight_logs_${new Date().toISOString().split("T")[0]}.xlsx`
): void {
  if (logs.length === 0) {
    alert("No data to export");
    return;
  }

  const headers = [
    "ID",
    "Date",
    "Student",
    "Instructor",
    "Aircraft",
    "Flight Type",
    "Exercise",
    "Takeoff",
    "Landing",
    "Duration (HH:MM)",
    "Landing Type",
    "Landing Count",
  ];

  const rows = logs.map((log) => [
    log.id.toString(),
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

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

  // Column widths
  ws["!cols"] = [
    { wch: 10 }, // ID
    { wch: 12 }, // Date
    { wch: 20 }, // Student
    { wch: 20 }, // Instructor
    { wch: 12 }, // Aircraft
    { wch: 12 }, // Flight Type
    { wch: 22 }, // Exercise
    { wch: 10 }, // Takeoff
    { wch: 10 }, // Landing
    { wch: 16 }, // Duration
    { wch: 14 }, // Landing Type
    { wch: 14 }, // Landing Count
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Flight Logs");
  XLSX.writeFile(wb, filename);
}

// ─── All Data (multi-sheet) ────────────────────────────────────────────────────

/**
 * Export all flight school data to a multi-sheet Excel file and trigger download.
 */
export function exportAllDataToExcel(
  students: Student[],
  instructors: Instructor[],
  aircraft: Aircraft[],
  exercises: Exercise[],
  flightLogs: FlightLog[],
  filename: string = `flight_school_backup_${new Date().toISOString().split("T")[0]}.xlsx`
): void {
  const wb = XLSX.utils.book_new();

  // ── Sheet 1: Flight Logs ──────────────────────────────────────────────────
  const flightHeaders = [
    "ID",
    "Date",
    "Student",
    "Instructor",
    "Aircraft",
    "Flight Type",
    "Exercise",
    "Takeoff",
    "Landing",
    "Duration (HH:MM)",
    "Landing Type",
    "Landing Count",
  ];
  const flightRows = flightLogs.map((log) => [
    log.id.toString(),
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
  const wsFlights = XLSX.utils.aoa_to_sheet([flightHeaders, ...flightRows]);
  wsFlights["!cols"] = [
    { wch: 10 }, { wch: 12 }, { wch: 20 }, { wch: 20 }, { wch: 12 },
    { wch: 12 }, { wch: 22 }, { wch: 10 }, { wch: 10 }, { wch: 16 },
    { wch: 14 }, { wch: 14 },
  ];
  XLSX.utils.book_append_sheet(wb, wsFlights, "Flight Logs");

  // ── Sheet 2: Students ─────────────────────────────────────────────────────
  const studentHeaders = [
    "Name",
    "License Number",
    "Medical Expiry",
    "Total Flight Hours",
    "Phone",
    "Email",
  ];
  const studentRows = students.map((s) => [
    s.name,
    s.licenseNumber,
    s.medicalExpiry,
    s.totalFlightHours.toString(),
    s.phone,
    s.email,
  ]);
  const wsStudents = XLSX.utils.aoa_to_sheet([studentHeaders, ...studentRows]);
  wsStudents["!cols"] = [
    { wch: 22 }, { wch: 18 }, { wch: 16 }, { wch: 18 }, { wch: 16 }, { wch: 28 },
  ];
  XLSX.utils.book_append_sheet(wb, wsStudents, "Students");

  // ── Sheet 3: Instructors ──────────────────────────────────────────────────
  const instructorHeaders = ["Name", "Certificate Number", "Rating", "Phone", "Email"];
  const instructorRows = instructors.map((i) => [
    i.name,
    i.certificateNumber,
    i.rating,
    i.phone,
    i.email,
  ]);
  const wsInstructors = XLSX.utils.aoa_to_sheet([instructorHeaders, ...instructorRows]);
  wsInstructors["!cols"] = [
    { wch: 22 }, { wch: 20 }, { wch: 16 }, { wch: 16 }, { wch: 28 },
  ];
  XLSX.utils.book_append_sheet(wb, wsInstructors, "Instructors");

  // ── Sheet 4: Aircraft ─────────────────────────────────────────────────────
  const aircraftHeaders = [
    "Registration",
    "Make/Model",
    "Total Airframe Hours",
    "Last Maintenance Date",
    "Hourly Rate",
  ];
  const aircraftRows = aircraft.map((a) => [
    a.registration,
    a.makeModel,
    a.totalAirframeHours.toString(),
    a.lastMaintenanceDate,
    a.hourlyRate.toString(),
  ]);
  const wsAircraft = XLSX.utils.aoa_to_sheet([aircraftHeaders, ...aircraftRows]);
  wsAircraft["!cols"] = [
    { wch: 14 }, { wch: 20 }, { wch: 22 }, { wch: 22 }, { wch: 14 },
  ];
  XLSX.utils.book_append_sheet(wb, wsAircraft, "Aircraft");

  // ── Sheet 5: Exercises ────────────────────────────────────────────────────
  const exerciseHeaders = ["Name", "Description", "Duration (minutes)", "Difficulty Level"];
  const exerciseRows = exercises.map((e) => [
    e.name,
    e.description,
    e.durationMinutes.toString(),
    e.difficultyLevel,
  ]);
  const wsExercises = XLSX.utils.aoa_to_sheet([exerciseHeaders, ...exerciseRows]);
  wsExercises["!cols"] = [
    { wch: 24 }, { wch: 40 }, { wch: 20 }, { wch: 18 },
  ];
  XLSX.utils.book_append_sheet(wb, wsExercises, "Exercises");

  XLSX.writeFile(wb, filename);
}
