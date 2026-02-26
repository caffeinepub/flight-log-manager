import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";
import type {
  Student,
  Instructor,
  Aircraft,
  Exercise,
  FlightLog,
  DailySummary,
  MonthlySummary,
  AircraftHours,
  AdminUserInfo,
  UserRole,
} from "../backend";
import type { Principal } from "@icp-sdk/core/principal";

// ============= Students =============
export function useGetAllStudents() {
  const { actor, isFetching } = useActor();
  return useQuery<Student[]>({
    queryKey: ["students"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllStudents();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddStudent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (student: Student) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addStudent(student);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
}

export function useUpdateStudent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      oldName,
      newStudent,
    }: {
      oldName: string;
      newStudent: Student;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateStudent(oldName, newStudent);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["flightLogs"] });
    },
  });
}

export function useDeleteStudent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteStudent(name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
}

// ============= Instructors =============
export function useGetAllInstructors() {
  const { actor, isFetching } = useActor();
  return useQuery<Instructor[]>({
    queryKey: ["instructors"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllInstructors();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddInstructor() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (instructor: Instructor) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addInstructor(instructor);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructors"] });
    },
  });
}

export function useUpdateInstructor() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      oldName,
      newInstructor,
    }: {
      oldName: string;
      newInstructor: Instructor;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateInstructor(oldName, newInstructor);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructors"] });
      queryClient.invalidateQueries({ queryKey: ["flightLogs"] });
    },
  });
}

export function useDeleteInstructor() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteInstructor(name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructors"] });
    },
  });
}

// ============= Aircraft =============
export function useGetAllAircraft() {
  const { actor, isFetching } = useActor();
  return useQuery<Aircraft[]>({
    queryKey: ["aircraft"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllAircrafts();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddAircraft() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (aircraft: Aircraft) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addAircraft(aircraft);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["aircraft"] });
    },
  });
}

export function useUpdateAircraft() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      oldReg,
      newAircraft,
    }: {
      oldReg: string;
      newAircraft: Aircraft;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateAircraft(oldReg, newAircraft);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["aircraft"] });
      queryClient.invalidateQueries({ queryKey: ["flightLogs"] });
      queryClient.invalidateQueries({ queryKey: ["aircraftHours"] });
    },
  });
}

export function useDeleteAircraft() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (registration: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteAircraft(registration);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["aircraft"] });
    },
  });
}

// ============= Exercises =============
export function useGetAllExercises() {
  const { actor, isFetching } = useActor();
  return useQuery<Exercise[]>({
    queryKey: ["exercises"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllExercises();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddExercise() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (exercise: Exercise) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addExercise(exercise);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
    },
  });
}

export function useUpdateExercise() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      oldName,
      newExercise,
    }: {
      oldName: string;
      newExercise: Exercise;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateExercise(oldName, newExercise);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
      queryClient.invalidateQueries({ queryKey: ["flightLogs"] });
    },
  });
}

export function useDeleteExercise() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteExercise(name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
    },
  });
}

// ============= Flight Logs =============
export function useGetAllFlightLogs() {
  const { actor, isFetching } = useActor();
  return useQuery<FlightLog[]>({
    queryKey: ["flightLogs"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllFlightLogs();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateFlightLog() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (log: FlightLog) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createFlightLog(log);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flightLogs"] });
      queryClient.invalidateQueries({ queryKey: ["dailySummary"] });
      queryClient.invalidateQueries({ queryKey: ["monthlySummary"] });
      queryClient.invalidateQueries({ queryKey: ["aircraftHours"] });
    },
  });
}

export function useUpdateFlightLog() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (log: FlightLog) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateFlightLog(log);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flightLogs"] });
      queryClient.invalidateQueries({ queryKey: ["dailySummary"] });
      queryClient.invalidateQueries({ queryKey: ["monthlySummary"] });
      queryClient.invalidateQueries({ queryKey: ["aircraftHours"] });
    },
  });
}

export function useDeleteFlightLog() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteFlightLog(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flightLogs"] });
      queryClient.invalidateQueries({ queryKey: ["dailySummary"] });
      queryClient.invalidateQueries({ queryKey: ["monthlySummary"] });
      queryClient.invalidateQueries({ queryKey: ["aircraftHours"] });
    },
  });
}

export function useGetFlightLogsByMonth(month: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<FlightLog[]>({
    queryKey: ["flightLogs", "month", month],
    queryFn: async () => {
      if (!actor || !month) return [];
      return actor.getFlightLogsByMonth(month);
    },
    enabled: !!actor && !isFetching && !!month,
  });
}

export function useGetFlightLogsByStudent(studentName: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<FlightLog[]>({
    queryKey: ["flightLogs", "student", studentName],
    queryFn: async () => {
      if (!actor || !studentName) return [];
      return actor.getFlightLogsByStudent(studentName);
    },
    enabled: !!actor && !isFetching && !!studentName,
  });
}

export function useGetFlightLogsByAircraft(registration: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<FlightLog[]>({
    queryKey: ["flightLogs", "aircraft", registration],
    queryFn: async () => {
      if (!actor || !registration) return [];
      return actor.getFlightLogsByAircraft(registration);
    },
    enabled: !!actor && !isFetching && !!registration,
  });
}

// ============= Reports =============
export function useGetDailySummary(date: string) {
  const { actor, isFetching } = useActor();
  return useQuery<DailySummary>({
    queryKey: ["dailySummary", date],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      try {
        return await actor.getDailySummary(date);
      } catch {
        return { date, totalFlights: 0n, totalHours: 0 };
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMonthlySummary(month: string) {
  const { actor, isFetching } = useActor();
  return useQuery<MonthlySummary>({
    queryKey: ["monthlySummary", month],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      try {
        return await actor.getMonthlySummary(month);
      } catch {
        return { month, totalFlights: 0n, totalHours: 0 };
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAircraftHours() {
  const { actor, isFetching } = useActor();
  return useQuery<AircraftHours[]>({
    queryKey: ["aircraftHours"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getTotalHoursPerAircraft();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

// ============= User Profile =============
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      try {
        return await actor.getCallerUserProfile();
      } catch {
        // New user who has no role yet - treat as no profile
        return null;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.saveCallerUserProfile({ name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
      queryClient.invalidateQueries({ queryKey: ["isAdmin"] });
    },
  });
}

export function useCreateOrGetProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createOrGetProfile({ name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
      queryClient.invalidateQueries({ queryKey: ["isAdmin"] });
    },
  });
}

// ============= Admin Check =============
export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch {
        return false;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

// ============= Admin User Management =============
export function useGetAllUsersWithProfiles() {
  const { actor, isFetching } = useActor();
  return useQuery<AdminUserInfo[]>({
    queryKey: ["allUsersWithProfiles"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllUsersWithProfiles();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAssignUserRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      principal,
      role,
    }: {
      principal: Principal;
      role: UserRole;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.assignUserRole(principal, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allUsersWithProfiles"] });
    },
  });
}
