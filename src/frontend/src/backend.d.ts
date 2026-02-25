import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Exercise {
    difficultyLevel: string;
    name: string;
    description: string;
    durationMinutes: bigint;
}
export interface DailySummary {
    totalFlights: bigint;
    totalHours: number;
    date: string;
}
export interface Instructor {
    name: string;
    email: string;
    rating: string;
    phone: string;
    certificateNumber: string;
}
export interface AircraftHours {
    totalHours: number;
    registration: string;
}
export interface AdminUserInfo {
    principal: Principal;
    role: UserRole;
    profile: UserProfile;
}
export interface MonthlySummary {
    month: string;
    totalFlights: bigint;
    totalHours: number;
}
export interface FlightLog {
    id: bigint;
    aircraftRegistration: string;
    studentName: string;
    date: string;
    flightType: string;
    durationMinutes: bigint;
    exerciseName: string;
    takeoffTime: string;
    landingTime: string;
    landingType: string;
    landingCount: bigint;
    instructorName: string;
}
export interface Aircraft {
    totalAirframeHours: bigint;
    registration: string;
    hourlyRate: bigint;
    makeModel: string;
    lastMaintenanceDate: string;
}
export interface UserProfile {
    name: string;
}
export interface Student {
    totalFlightHours: bigint;
    name: string;
    email: string;
    medicalExpiry: string;
    licenseNumber: string;
    phone: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addAircraft(aircraft: Aircraft): Promise<string>;
    addExercise(exercise: Exercise): Promise<string>;
    addInstructor(instructor: Instructor): Promise<string>;
    addStudent(student: Student): Promise<string>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    assignUserRole(user: Principal, role: UserRole): Promise<void>;
    createFlightLog(log: FlightLog): Promise<bigint>;
    createOrGetProfile(profile: UserProfile): Promise<UserProfile>;
    deleteAircraft(registration: string): Promise<void>;
    deleteExercise(name: string): Promise<void>;
    deleteFlightLog(id: bigint): Promise<void>;
    deleteInstructor(name: string): Promise<void>;
    deleteStudent(name: string): Promise<void>;
    getAllAircrafts(): Promise<Array<Aircraft>>;
    getAllExercises(): Promise<Array<Exercise>>;
    getAllFlightLogs(): Promise<Array<FlightLog>>;
    getAllInstructors(): Promise<Array<Instructor>>;
    getAllStudents(): Promise<Array<Student>>;
    getAllUsersWithProfiles(): Promise<Array<AdminUserInfo>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDailySummary(date: string): Promise<DailySummary>;
    getFlightLogById(id: bigint): Promise<FlightLog | null>;
    getFlightLogsByAircraft(registration: string): Promise<Array<FlightLog>>;
    getFlightLogsByDateRange(startDate: string, endDate: string): Promise<Array<FlightLog>>;
    getFlightLogsByInstructor(instructorName: string): Promise<Array<FlightLog>>;
    getFlightLogsByMonth(month: string): Promise<Array<FlightLog>>;
    getFlightLogsByStudent(studentName: string): Promise<Array<FlightLog>>;
    getMonthlySummary(month: string): Promise<MonthlySummary>;
    getTotalHoursPerAircraft(): Promise<Array<AircraftHours>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateAircraft(oldReg: string, newAircraft: Aircraft): Promise<void>;
    updateExercise(oldName: string, newExercise: Exercise): Promise<void>;
    updateFlightLog(log: FlightLog): Promise<void>;
    updateInstructor(oldName: string, newInstructor: Instructor): Promise<void>;
    updateStudent(oldName: string, newStudent: Student): Promise<void>;
}
