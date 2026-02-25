import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSaveCallerUserProfile, useIsCallerAdmin } from "../hooks/useQueries";
import { toast } from "sonner";
import { Loader2, Shield, Sparkles } from "lucide-react";
import { useActor } from "../hooks/useActor";
import { useQueryClient } from "@tanstack/react-query";

interface ProfileSetupProps {
  open: boolean;
}

// Seed data for new admin users
const SEED_DATA = {
  students: [
    { name: "John Smith", licenseNumber: "PPL12345", medicalExpiry: "2026-12-31", totalFlightHours: 50n, phone: "+1-555-0101", email: "john.smith@example.com" },
    { name: "Sarah Johnson", licenseNumber: "PPL23456", medicalExpiry: "2026-11-30", totalFlightHours: 75n, phone: "+1-555-0102", email: "sarah.johnson@example.com" },
    { name: "Michael Chen", licenseNumber: "PPL34567", medicalExpiry: "2026-10-31", totalFlightHours: 30n, phone: "+1-555-0103", email: "michael.chen@example.com" },
    { name: "Emily Davis", licenseNumber: "PPL45678", medicalExpiry: "2027-01-31", totalFlightHours: 100n, phone: "+1-555-0104", email: "emily.davis@example.com" },
    { name: "Robert Williams", licenseNumber: "PPL56789", medicalExpiry: "2026-09-30", totalFlightHours: 25n, phone: "+1-555-0105", email: "robert.williams@example.com" },
  ],
  instructors: [
    { name: "Captain Mark Wilson", certificateNumber: "CFI98765", rating: "CFI, CFII", phone: "+1-555-0201", email: "mark.wilson@example.com" },
    { name: "Captain Lisa Anderson", certificateNumber: "CFI87654", rating: "CFI, MEI", phone: "+1-555-0202", email: "lisa.anderson@example.com" },
    { name: "Captain David Brown", certificateNumber: "CFI76543", rating: "CFI, CFII, MEI", phone: "+1-555-0203", email: "david.brown@example.com" },
    { name: "Captain Jennifer Taylor", certificateNumber: "CFI65432", rating: "CFI", phone: "+1-555-0204", email: "jennifer.taylor@example.com" },
  ],
  aircraft: [
    { registration: "N12345", makeModel: "Cessna 172", totalAirframeHours: 4500n, lastMaintenanceDate: "2025-01-15", hourlyRate: 150n },
    { registration: "N67890", makeModel: "Piper PA-28", totalAirframeHours: 3200n, lastMaintenanceDate: "2025-02-10", hourlyRate: 140n },
    { registration: "N24680", makeModel: "Cessna 152", totalAirframeHours: 5600n, lastMaintenanceDate: "2024-12-20", hourlyRate: 120n },
    { registration: "N13579", makeModel: "Diamond DA40", totalAirframeHours: 2100n, lastMaintenanceDate: "2025-02-01", hourlyRate: 180n },
    { registration: "N11223", makeModel: "Cirrus SR20", totalAirframeHours: 1800n, lastMaintenanceDate: "2025-01-25", hourlyRate: 220n },
  ],
  exercises: [
    { name: "Circuit Training", description: "Pattern work including takeoffs and landings", durationMinutes: 60n, difficultyLevel: "Beginner" },
    { name: "Cross Country Navigation", description: "Navigation exercises over longer distances", durationMinutes: 120n, difficultyLevel: "Intermediate" },
    { name: "Night Flying", description: "Night operations and procedures", durationMinutes: 90n, difficultyLevel: "Advanced" },
    { name: "Instrument Training", description: "Training under simulated or actual instrument conditions", durationMinutes: 120n, difficultyLevel: "Advanced" },
    { name: "Emergency Procedures", description: "Practice of emergency scenarios and responses", durationMinutes: 60n, difficultyLevel: "Intermediate" },
    { name: "Solo Practice", description: "Student solo practice flights", durationMinutes: 60n, difficultyLevel: "Intermediate" },
    { name: "Takeoff and Landing", description: "Focused practice on takeoffs and landings", durationMinutes: 45n, difficultyLevel: "Beginner" },
  ],
};

export default function ProfileSetup({ open }: ProfileSetupProps) {
  const [name, setName] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const saveProfile = useSaveCallerUserProfile();
  const { data: isAdmin, refetch: refetchAdmin } = useIsCallerAdmin();
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const seedInitialData = async () => {
    if (!actor) return;

    try {
      setIsSeeding(true);

      // Check if data already exists
      const existingStudents = await actor.getAllStudents();
      
      // Only seed if no students exist
      if (existingStudents.length === 0) {
        // Add all students in parallel
        await Promise.all(
          SEED_DATA.students.map((student) => actor.addStudent(student))
        );

        // Add all instructors in parallel
        await Promise.all(
          SEED_DATA.instructors.map((instructor) => actor.addInstructor(instructor))
        );

        // Add all aircraft in parallel
        await Promise.all(
          SEED_DATA.aircraft.map((registration) => actor.addAircraft(registration))
        );

        // Add all exercises in parallel
        await Promise.all(
          SEED_DATA.exercises.map((exercise) => actor.addExercise(exercise))
        );

        // Invalidate all relevant queries to refresh the UI
        queryClient.invalidateQueries({ queryKey: ["students"] });
        queryClient.invalidateQueries({ queryKey: ["instructors"] });
        queryClient.invalidateQueries({ queryKey: ["aircraft"] });
        queryClient.invalidateQueries({ queryKey: ["exercises"] });
      }
    } catch (error) {
      console.error("Failed to seed data:", error);
      // Don't show error to user - this is a nice-to-have feature
    } finally {
      setIsSeeding(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    try {
      await saveProfile.mutateAsync(name.trim());
      await refetchAdmin();
      setShowSuccess(true);

      // If user is admin, seed data after showing success
      const adminStatus = await actor?.isCallerAdmin();
      if (adminStatus) {
        await seedInitialData();
      }
    } catch (error) {
      console.error("Failed to save profile:", error);
      toast.error("Failed to create profile");
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        {!showSuccess ? (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">
                Welcome to Flight Log
              </DialogTitle>
              <DialogDescription>
                Please enter your name to complete your profile setup.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={saveProfile.isPending}
                  autoFocus
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={saveProfile.isPending || !name.trim()}
              >
                {saveProfile.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Profile...
                  </>
                ) : (
                  "Continue"
                )}
              </Button>
            </form>
          </>
        ) : isSeeding ? (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">
                Setting Up Your Flight School
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="relative">
                <Sparkles className="h-12 w-12 text-primary animate-pulse" />
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
              </div>
              <p className="text-muted-foreground text-center">
                Setting up your flight school data...
              </p>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">
                Welcome, {name}!
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              {isAdmin && (
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div className="space-y-1 text-sm">
                    <p className="font-medium text-foreground">Welcome! You're the administrator of this flight school system.</p>
                    <p className="text-muted-foreground">Sample students, instructors, aircraft, and exercises have been added to get you started.</p>
                  </div>
                </div>
              )}
              {!isAdmin && (
                <p className="text-sm text-muted-foreground">
                  Welcome! Please contact your administrator to gain access.
                </p>
              )}
              <Button
                className="w-full"
                onClick={() => {
                  toast.success("Profile created successfully");
                  setShowSuccess(false);
                }}
              >
                Get Started
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
