import Map "mo:core/Map";
import Nat "mo:core/Nat";

module {
  // Extended types
  type ExtendedStudent = {
    name : Text;
    licenseNumber : Text;
    medicalExpiry : Text;
    totalFlightHours : Nat;
    phone : Text;
    email : Text;
  };

  type ExtendedInstructor = {
    name : Text;
    certificateNumber : Text;
    rating : Text;
    phone : Text;
    email : Text;
  };

  type ExtendedAircraft = {
    registration : Text;
    makeModel : Text;
    totalAirframeHours : Nat;
    lastMaintenanceDate : Text;
    hourlyRate : Nat;
  };

  type ExtendedExercise = {
    name : Text;
    description : Text;
    durationMinutes : Nat;
    difficultyLevel : Text;
  };

  // Old types for compatibility
  type OldStudent = {
    name : Text;
  };

  type OldInstructor = {
    name : Text;
  };

  type OldAircraft = {
    registration : Text;
  };

  type OldExercise = {
    name : Text;
  };

  type OldActor = {
    students : Map.Map<Text, OldStudent>;
    instructors : Map.Map<Text, OldInstructor>;
    aircrafts : Map.Map<Text, OldAircraft>;
    exercises : Map.Map<Text, OldExercise>;
  };

  type NewActor = {
    students : Map.Map<Text, ExtendedStudent>;
    instructors : Map.Map<Text, ExtendedInstructor>;
    aircrafts : Map.Map<Text, ExtendedAircraft>;
    exercises : Map.Map<Text, ExtendedExercise>;
  };

  public func run(old : OldActor) : NewActor {
    let newStudents = old.students.map<Text, OldStudent, ExtendedStudent>(
      func(_name, oldStudent) {
        {
          oldStudent with
          licenseNumber = "";
          medicalExpiry = "";
          totalFlightHours = 0;
          phone = "";
          email = "";
        };
      }
    );

    let newInstructors = old.instructors.map<Text, OldInstructor, ExtendedInstructor>(
      func(_name, oldInstructor) {
        {
          oldInstructor with
          certificateNumber = "";
          rating = "";
          phone = "";
          email = "";
        };
      }
    );

    let newAircrafts = old.aircrafts.map<Text, OldAircraft, ExtendedAircraft>(
      func(_reg, oldAircraft) {
        {
          oldAircraft with
          makeModel = "";
          totalAirframeHours = 0;
          lastMaintenanceDate = "";
          hourlyRate = 0;
        };
      }
    );

    let newExercises = old.exercises.map<Text, OldExercise, ExtendedExercise>(
      func(_name, oldExercise) {
        {
          oldExercise with
          description = "";
          durationMinutes = 0;
          difficultyLevel = "";
        };
      }
    );

    {
      students = newStudents;
      instructors = newInstructors;
      aircrafts = newAircrafts;
      exercises = newExercises;
    };
  };
};
