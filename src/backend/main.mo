import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Int "mo:core/Int";
import Float "mo:core/Float";
import Text "mo:core/Text";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Migration "migration";

(with migration = Migration.run)
actor {
  // Data Types
  public type Student = {
    name : Text;
    licenseNumber : Text;
    medicalExpiry : Text;
    totalFlightHours : Nat;
    phone : Text;
    email : Text;
  };

  public type Instructor = {
    name : Text;
    certificateNumber : Text;
    rating : Text;
    phone : Text;
    email : Text;
  };

  public type Aircraft = {
    registration : Text;
    makeModel : Text;
    totalAirframeHours : Nat;
    lastMaintenanceDate : Text;
    hourlyRate : Nat;
  };

  public type Exercise = {
    name : Text;
    description : Text;
    durationMinutes : Nat;
    difficultyLevel : Text;
  };

  public type FlightLog = {
    id : Nat;
    date : Text;
    studentName : Text;
    instructorName : Text;
    aircraftRegistration : Text;
    exerciseName : Text;
    flightType : Text;
    takeoffTime : Text;
    landingTime : Text;
    durationMinutes : Nat;
    landingType : Text;
    landingCount : Nat;
  };

  public type UserProfile = {
    name : Text;
  };

  public type UserRole = {
    #admin;
    #user;
    #guest;
  };

  public type DailySummary = {
    date : Text;
    totalFlights : Nat;
    totalHours : Float;
  };

  public type MonthlySummary = {
    month : Text;
    totalFlights : Nat;
    totalHours : Float;
  };

  public type AircraftHours = {
    registration : Text;
    totalHours : Float;
  };

  public type AdminUserInfo = {
    principal : Principal;
    profile : UserProfile;
    role : UserRole;
  };

  // Persistent storage
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  var nextFlightLogId : Nat = 1;
  let students = Map.empty<Text, Student>();
  let instructors = Map.empty<Text, Instructor>();
  let aircrafts = Map.empty<Text, Aircraft>();
  let exercises = Map.empty<Text, Exercise>();
  let flightLogs = Map.empty<Nat, FlightLog>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Helper function to count admins
  func countAdmins() : Nat {
    var adminCount : Nat = 0;
    for (principal in userProfiles.keys()) {
      if (AccessControl.isAdmin(accessControlState, principal)) {
        adminCount += 1;
      };
    };
    adminCount;
  };

  // Custom role assignment function with admin count validation
  public shared ({ caller }) func assignUserRole(user : Principal, role : UserRole) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can assign roles");
    };

    // Check if we're demoting an admin
    let currentRole = AccessControl.getUserRole(accessControlState, user);
    let isDemotingAdmin = switch (currentRole) {
      case (#admin) {
        switch (role) {
          case (#admin) { false };
          case (_) { true };
        };
      };
      case (_) { false };
    };

    // If demoting an admin, ensure at least one admin remains
    if (isDemotingAdmin) {
      let adminCount = countAdmins();
      if (adminCount <= 1) {
        Runtime.trap("Cannot demote the last admin. At least one admin must exist in the system.");
      };
    };

    switch (role) {
      case (#admin) { AccessControl.assignRole(accessControlState, caller, user, #admin) };
      case (#user) { AccessControl.assignRole(accessControlState, caller, user, #user) };
      case (#guest) { AccessControl.assignRole(accessControlState, caller, user, #guest) };
    };
  };

  // User Profile Operations
  public shared ({ caller }) func createOrGetProfile(profile : UserProfile) : async UserProfile {
    // Auto-assign admin role to first user
    if (userProfiles.size() == 0) {
      // Pass default tokens for adminToken and userProvidedToken
      AccessControl.initialize(accessControlState, caller, "", "");
      userProfiles.add(caller, profile);
      return profile;
    };

    // Otherwise, existing users must be at least #user
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create profiles");
    };

    // Add or update profile
    userProfiles.add(caller, profile);
    profile;
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  // Admin-only: Get all users with profiles and roles
  public query ({ caller }) func getAllUsersWithProfiles() : async [AdminUserInfo] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all users");
    };

    userProfiles.toArray().map<(Principal, UserProfile), AdminUserInfo>(
      func((p, profile)) : AdminUserInfo {
        {
          principal = p;
          profile = profile;
          role = AccessControl.getUserRole(accessControlState, p);
        };
      }
    );
  };

  // Student Operations
  public shared ({ caller }) func addStudent(student : Student) : async Text {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add students");
    };
    switch (students.get(student.name)) {
      case (null) {
        students.add(student.name, student);
        student.name;
      };
      case (?_) { Runtime.trap("Student already exists") };
    };
  };

  public query ({ caller }) func getAllStudents() : async [Student] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view students");
    };
    students.values().toArray();
  };

  public shared ({ caller }) func updateStudent(oldName : Text, newStudent : Student) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update students");
    };
    switch (students.get(oldName)) {
      case (null) { Runtime.trap("Student not found") };
      case (?_) {
        students.remove(oldName);
        students.add(newStudent.name, newStudent);
      };
    };
  };

  public shared ({ caller }) func deleteStudent(name : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete students");
    };
    if (not students.containsKey(name)) {
      Runtime.trap("Student not found");
    };
    students.remove(name);
  };

  // Instructor Operations
  public shared ({ caller }) func addInstructor(instructor : Instructor) : async Text {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add instructors");
    };
    switch (instructors.get(instructor.name)) {
      case (null) {
        instructors.add(instructor.name, instructor);
        instructor.name;
      };
      case (?_) { Runtime.trap("Instructor already exists") };
    };
  };

  public query ({ caller }) func getAllInstructors() : async [Instructor] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view instructors");
    };
    instructors.values().toArray();
  };

  public shared ({ caller }) func updateInstructor(oldName : Text, newInstructor : Instructor) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update instructors");
    };
    switch (instructors.get(oldName)) {
      case (null) { Runtime.trap("Instructor not found") };
      case (?_) {
        instructors.remove(oldName);
        instructors.add(newInstructor.name, newInstructor);
      };
    };
  };

  public shared ({ caller }) func deleteInstructor(name : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete instructors");
    };
    if (not instructors.containsKey(name)) {
      Runtime.trap("Instructor not found");
    };
    instructors.remove(name);
  };

  // Aircraft Operations
  public shared ({ caller }) func addAircraft(aircraft : Aircraft) : async Text {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add aircraft");
    };
    switch (aircrafts.get(aircraft.registration)) {
      case (null) {
        aircrafts.add(aircraft.registration, aircraft);
        aircraft.registration;
      };
      case (?_) { Runtime.trap("Aircraft already exists") };
    };
  };

  public query ({ caller }) func getAllAircrafts() : async [Aircraft] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view aircraft");
    };
    aircrafts.values().toArray();
  };

  public shared ({ caller }) func updateAircraft(oldReg : Text, newAircraft : Aircraft) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update aircraft");
    };
    switch (aircrafts.get(oldReg)) {
      case (null) { Runtime.trap("Aircraft not found") };
      case (?_) {
        aircrafts.remove(oldReg);
        aircrafts.add(newAircraft.registration, newAircraft);
      };
    };
  };

  public shared ({ caller }) func deleteAircraft(registration : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete aircraft");
    };
    if (not aircrafts.containsKey(registration)) {
      Runtime.trap("Aircraft not found");
    };
    aircrafts.remove(registration);
  };

  // Exercise Operations
  public shared ({ caller }) func addExercise(exercise : Exercise) : async Text {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add exercises");
    };
    switch (exercises.get(exercise.name)) {
      case (null) {
        exercises.add(exercise.name, exercise);
        exercise.name;
      };
      case (?_) { Runtime.trap("Exercise already exists") };
    };
  };

  public query ({ caller }) func getAllExercises() : async [Exercise] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view exercises");
    };
    exercises.values().toArray();
  };

  public shared ({ caller }) func updateExercise(oldName : Text, newExercise : Exercise) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update exercises");
    };
    switch (exercises.get(oldName)) {
      case (null) { Runtime.trap("Exercise not found") };
      case (?_) {
        exercises.remove(oldName);
        exercises.add(newExercise.name, newExercise);
      };
    };
  };

  public shared ({ caller }) func deleteExercise(name : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete exercises");
    };
    if (not exercises.containsKey(name)) {
      Runtime.trap("Exercise not found");
    };
    exercises.remove(name);
  };

  // Flight Log Operations
  public shared ({ caller }) func createFlightLog(log : FlightLog) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create flight logs");
    };

    let logWithId = { log with id = nextFlightLogId };
    flightLogs.add(nextFlightLogId, logWithId);
    nextFlightLogId += 1;
    logWithId.id;
  };

  public query ({ caller }) func getAllFlightLogs() : async [FlightLog] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view flight logs");
    };
    flightLogs.values().toArray();
  };

  public query ({ caller }) func getFlightLogById(id : Nat) : async ?FlightLog {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view flight logs");
    };
    flightLogs.get(id);
  };

  public shared ({ caller }) func updateFlightLog(log : FlightLog) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can update flight logs");
    };

    switch (flightLogs.get(log.id)) {
      case (null) { Runtime.trap("Flight log not found") };
      case (?_) {
        flightLogs.add(log.id, log);
      };
    };
  };

  public shared ({ caller }) func deleteFlightLog(id : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can delete flight logs");
    };

    switch (flightLogs.get(id)) {
      case (null) { Runtime.trap("Flight log not found") };
      case (?_) {
        flightLogs.remove(id);
      };
    };
  };

  public query ({ caller }) func getFlightLogsByDateRange(startDate : Text, endDate : Text) : async [FlightLog] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can filter flights by date range");
    };

    flightLogs.values().toArray().filter<FlightLog>(
      func(log) { log.date >= startDate and log.date <= endDate }
    );
  };

  public query ({ caller }) func getFlightLogsByMonth(month : Text) : async [FlightLog] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can filter flights by month");
    };

    flightLogs.values().toArray().filter<FlightLog>(
      func(log) {
        log.date.size() >= 7 and log.date.startsWith(#text month)
      }
    );
  };

  public query ({ caller }) func getFlightLogsByStudent(studentName : Text) : async [FlightLog] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can filter flights by student");
    };

    flightLogs.values().toArray().filter<FlightLog>(
      func(log) { log.studentName == studentName }
    );
  };

  public query ({ caller }) func getFlightLogsByAircraft(registration : Text) : async [FlightLog] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can filter flights by aircraft");
    };

    flightLogs.values().toArray().filter<FlightLog>(
      func(log) { log.aircraftRegistration == registration }
    );
  };

  public query ({ caller }) func getFlightLogsByInstructor(instructorName : Text) : async [FlightLog] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can filter flights by instructor");
    };

    flightLogs.values().toArray().filter<FlightLog>(
      func(log) { log.instructorName == instructorName }
    );
  };

  // Report Operations
  public query ({ caller }) func getDailySummary(date : Text) : async DailySummary {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view daily summaries");
    };

    let logs = flightLogs.values().toArray().filter(
      func(log) { log.date == date }
    );
    let totalFlights = logs.size();
    var totalMinutes : Nat = 0;
    for (log in logs.vals()) {
      totalMinutes += log.durationMinutes;
    };
    let totalHours = totalMinutes.toInt().toFloat() / 60.0;

    {
      date = date;
      totalFlights = totalFlights;
      totalHours = totalHours;
    };
  };

  public query ({ caller }) func getMonthlySummary(month : Text) : async MonthlySummary {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view monthly summaries");
    };

    let logs = flightLogs.values().toArray().filter(
      func(log) {
        log.date.size() >= 7 and log.date.startsWith(#text month)
      }
    );
    let totalFlights = logs.size();
    var totalMinutes : Nat = 0;
    for (log in logs.vals()) {
      totalMinutes += log.durationMinutes;
    };
    let totalHours = totalMinutes.toInt().toFloat() / 60.0;

    {
      month = month;
      totalFlights = totalFlights;
      totalHours = totalHours;
    };
  };

  public query ({ caller }) func getTotalHoursPerAircraft() : async [AircraftHours] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view aircraft hours");
    };

    let hoursMap = Map.empty<Text, Nat>();
    for (log in flightLogs.values()) {
      let currentMinutes = switch (hoursMap.get(log.aircraftRegistration)) {
        case (null) { 0 };
        case (?minutes) { minutes };
      };
      hoursMap.add(log.aircraftRegistration, currentMinutes + log.durationMinutes);
    };

    hoursMap.entries().toArray().map<(Text, Nat), AircraftHours>(
      func((registration, minutes)) : AircraftHours {
        {
          registration = registration;
          totalHours = minutes.toInt().toFloat() / 60.0;
        };
      }
    );
  };
};
