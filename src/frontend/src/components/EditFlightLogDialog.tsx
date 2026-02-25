import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useUpdateFlightLog, useGetAllStudents, useGetAllInstructors, useGetAllAircraft, useGetAllExercises } from "../hooks/useQueries";
import { calculateDuration, isValidTime, isValidDate } from "../utils/timeUtils";
import type { FlightLog } from "../backend";

interface EditFlightLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  log: FlightLog | null;
}

export default function EditFlightLogDialog({ open, onOpenChange, log }: EditFlightLogDialogProps) {
  const [date, setDate] = useState("");
  const [studentName, setStudentName] = useState("");
  const [instructorName, setInstructorName] = useState("");
  const [aircraftRegistration, setAircraftRegistration] = useState("");
  const [exerciseName, setExerciseName] = useState("");
  const [flightType, setFlightType] = useState("");
  const [takeoffTime, setTakeoffTime] = useState("");
  const [landingTime, setLandingTime] = useState("");
  const [landingType, setLandingType] = useState("");
  const [landingCount, setLandingCount] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: students } = useGetAllStudents();
  const { data: instructors } = useGetAllInstructors();
  const { data: aircraft } = useGetAllAircraft();
  const { data: exercises } = useGetAllExercises();

  const updateMutation = useUpdateFlightLog();

  // Calculate duration in real-time
  const calculatedDuration = React.useMemo(() => {
    if (takeoffTime && landingTime && isValidTime(takeoffTime) && isValidTime(landingTime)) {
      const duration = calculateDuration(takeoffTime, landingTime);
      if (duration > 0) {
        const hours = Math.floor(duration / 60);
        const minutes = duration % 60;
        return `${hours}h ${minutes}m`;
      }
    }
    return null;
  }, [takeoffTime, landingTime]);

  // Populate form when log changes
  useEffect(() => {
    if (log) {
      setDate(log.date);
      setStudentName(log.studentName);
      setInstructorName(log.instructorName);
      setAircraftRegistration(log.aircraftRegistration);
      setExerciseName(log.exerciseName);
      setFlightType(log.flightType);
      setTakeoffTime(log.takeoffTime);
      setLandingTime(log.landingTime);
      setLandingType(log.landingType);
      setLandingCount(log.landingCount.toString());
      setErrors({});
    }
  }, [log]);

  const handleSave = async () => {
    if (!log) return;

    // Clear previous errors
    const newErrors: Record<string, string> = {};

    // Validation
    if (!date) newErrors.date = "Date is required";
    else if (!isValidDate(date)) newErrors.date = "Invalid date format (use YYYY-MM-DD)";

    if (!studentName) newErrors.student = "Student is required";
    if (!instructorName) newErrors.instructor = "Instructor is required";
    if (!aircraftRegistration) newErrors.aircraft = "Aircraft is required";
    if (!exerciseName) newErrors.exercise = "Exercise is required";
    if (!flightType) newErrors.flightType = "Flight type is required";

    if (!takeoffTime) newErrors.takeoffTime = "Takeoff time is required";
    else if (!isValidTime(takeoffTime)) newErrors.takeoffTime = "Invalid time format (use HH:MM)";

    if (!landingTime) newErrors.landingTime = "Landing time is required";
    else if (!isValidTime(landingTime)) newErrors.landingTime = "Invalid time format (use HH:MM)";

    if (!landingType) newErrors.landingType = "Landing type is required";

    if (!landingCount) newErrors.landingCount = "Landing count is required";
    else {
      const countNum = parseInt(landingCount);
      if (isNaN(countNum) || countNum < 0) newErrors.landingCount = "Must be a positive number";
    }

    // Check duration
    if (isValidTime(takeoffTime) && isValidTime(landingTime)) {
      const durationMinutes = calculateDuration(takeoffTime, landingTime);
      if (durationMinutes <= 0) {
        newErrors.landingTime = "Landing time must be after takeoff time";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fix the errors before saving");
      return;
    }

    const durationMinutes = calculateDuration(takeoffTime, landingTime);
    const countNum = parseInt(landingCount);

    const updatedLog: FlightLog = {
      id: log.id,
      date,
      studentName,
      instructorName,
      aircraftRegistration,
      exerciseName,
      flightType,
      takeoffTime,
      landingTime,
      landingType,
      landingCount: BigInt(countNum),
      durationMinutes: BigInt(durationMinutes),
    };

    try {
      await updateMutation.mutateAsync(updatedLog);
      toast.success("Flight log updated successfully");
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update flight log");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">Edit Flight Log</DialogTitle>
          <DialogDescription>
            Update the flight log details below
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="edit-date">Date *</Label>
            <Input
              id="edit-date"
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setErrors((prev) => ({ ...prev, date: "" }));
              }}
              className={errors.date ? "border-destructive" : ""}
            />
            {errors.date && (
              <p className="text-xs text-destructive">{errors.date}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-student">Student *</Label>
            <Select 
              value={studentName} 
              onValueChange={(value) => {
                setStudentName(value);
                setErrors((prev) => ({ ...prev, student: "" }));
              }}
            >
              <SelectTrigger id="edit-student" className={errors.student ? "border-destructive" : ""}>
                <SelectValue placeholder="Select student" />
              </SelectTrigger>
              <SelectContent>
                {students?.map((s) => (
                  <SelectItem key={s.name} value={s.name}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.student && (
              <p className="text-xs text-destructive">{errors.student}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-instructor">Instructor *</Label>
            <Select 
              value={instructorName} 
              onValueChange={(value) => {
                setInstructorName(value);
                setErrors((prev) => ({ ...prev, instructor: "" }));
              }}
            >
              <SelectTrigger id="edit-instructor" className={errors.instructor ? "border-destructive" : ""}>
                <SelectValue placeholder="Select instructor" />
              </SelectTrigger>
              <SelectContent>
                {instructors?.map((i) => (
                  <SelectItem key={i.name} value={i.name}>
                    {i.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.instructor && (
              <p className="text-xs text-destructive">{errors.instructor}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-aircraft">Aircraft *</Label>
            <Select 
              value={aircraftRegistration} 
              onValueChange={(value) => {
                setAircraftRegistration(value);
                setErrors((prev) => ({ ...prev, aircraft: "" }));
              }}
            >
              <SelectTrigger id="edit-aircraft" className={errors.aircraft ? "border-destructive" : ""}>
                <SelectValue placeholder="Select aircraft" />
              </SelectTrigger>
              <SelectContent>
                {aircraft?.map((a) => (
                  <SelectItem key={a.registration} value={a.registration}>
                    {a.registration}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.aircraft && (
              <p className="text-xs text-destructive">{errors.aircraft}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-exercise">Exercise *</Label>
            <Select 
              value={exerciseName} 
              onValueChange={(value) => {
                setExerciseName(value);
                setErrors((prev) => ({ ...prev, exercise: "" }));
              }}
            >
              <SelectTrigger id="edit-exercise" className={errors.exercise ? "border-destructive" : ""}>
                <SelectValue placeholder="Select exercise" />
              </SelectTrigger>
              <SelectContent>
                {exercises?.map((e) => (
                  <SelectItem key={e.name} value={e.name}>
                    {e.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.exercise && (
              <p className="text-xs text-destructive">{errors.exercise}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-flight-type">Flight Type *</Label>
            <Select 
              value={flightType} 
              onValueChange={(value) => {
                setFlightType(value);
                setErrors((prev) => ({ ...prev, flightType: "" }));
              }}
            >
              <SelectTrigger id="edit-flight-type" className={errors.flightType ? "border-destructive" : ""}>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Solo">Solo</SelectItem>
                <SelectItem value="Dual">Dual</SelectItem>
              </SelectContent>
            </Select>
            {errors.flightType && (
              <p className="text-xs text-destructive">{errors.flightType}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-takeoff">Takeoff Time *</Label>
            <Input
              id="edit-takeoff"
              type="text"
              placeholder="14:30"
              value={takeoffTime}
              onChange={(e) => {
                setTakeoffTime(e.target.value);
                setErrors((prev) => ({ ...prev, takeoffTime: "" }));
              }}
              className={errors.takeoffTime ? "border-destructive" : ""}
            />
            <p className="text-xs text-muted-foreground">Format: HH:MM (e.g., 09:30)</p>
            {errors.takeoffTime && (
              <p className="text-xs text-destructive">{errors.takeoffTime}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-landing">Landing Time *</Label>
            <Input
              id="edit-landing"
              type="text"
              placeholder="16:00"
              value={landingTime}
              onChange={(e) => {
                setLandingTime(e.target.value);
                setErrors((prev) => ({ ...prev, landingTime: "" }));
              }}
              className={errors.landingTime ? "border-destructive" : ""}
            />
            <p className="text-xs text-muted-foreground">Format: HH:MM (e.g., 16:00)</p>
            {errors.landingTime && (
              <p className="text-xs text-destructive">{errors.landingTime}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-landing-type">Landing Type *</Label>
            <Select 
              value={landingType} 
              onValueChange={(value) => {
                setLandingType(value);
                setErrors((prev) => ({ ...prev, landingType: "" }));
              }}
            >
              <SelectTrigger id="edit-landing-type" className={errors.landingType ? "border-destructive" : ""}>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Day">Day</SelectItem>
                <SelectItem value="Night">Night</SelectItem>
              </SelectContent>
            </Select>
            {errors.landingType && (
              <p className="text-xs text-destructive">{errors.landingType}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-landing-count">Landing Count *</Label>
            <Input
              id="edit-landing-count"
              type="number"
              min="0"
              value={landingCount}
              onChange={(e) => {
                setLandingCount(e.target.value);
                setErrors((prev) => ({ ...prev, landingCount: "" }));
              }}
              className={errors.landingCount ? "border-destructive" : ""}
            />
            {errors.landingCount && (
              <p className="text-xs text-destructive">{errors.landingCount}</p>
            )}
          </div>
        </div>

        {calculatedDuration && (
          <div className="p-4 rounded-lg bg-accent/10 border border-accent/30">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">Calculated Duration:</span>
              <span className="text-lg font-bold text-accent">{calculatedDuration}</span>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={updateMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
