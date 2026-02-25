import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetAllStudents,
  useAddStudent,
  useUpdateStudent,
  useDeleteStudent,
  useIsCallerAdmin,
} from "../hooks/useQueries";
import type { Student } from "../backend";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Users, Loader2, Shield } from "lucide-react";

export default function StudentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Form state for adding
  const [newStudent, setNewStudent] = useState<Omit<Student, 'totalFlightHours'> & { totalFlightHours: string }>({
    name: "",
    licenseNumber: "",
    medicalExpiry: "",
    totalFlightHours: "0",
    phone: "",
    email: "",
  });

  // Form state for editing
  const [editingStudent, setEditingStudent] = useState<{
    oldName: string;
    student: Omit<Student, 'totalFlightHours'> & { totalFlightHours: string };
  } | null>(null);
  
  const [deletingStudent, setDeletingStudent] = useState<string | null>(null);

  const { data: students, isLoading } = useGetAllStudents();
  const { data: isAdmin } = useIsCallerAdmin();
  const addStudent = useAddStudent();
  const updateStudent = useUpdateStudent();
  const deleteStudent = useDeleteStudent();

  const filteredStudents = useMemo(() => {
    if (!students) return [];
    if (!searchTerm) return students;
    return students.filter((s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [students, searchTerm]);

  const handleAdd = async () => {
    if (!newStudent.name.trim()) {
      toast.error("Please enter a student name");
      return;
    }
    if (newStudent.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newStudent.email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    try {
      await addStudent.mutateAsync({
        ...newStudent,
        name: newStudent.name.trim(),
        totalFlightHours: BigInt(Math.floor(parseFloat(newStudent.totalFlightHours) || 0)),
      });
      toast.success("Student added successfully");
      setNewStudent({
        name: "",
        licenseNumber: "",
        medicalExpiry: "",
        totalFlightHours: "0",
        phone: "",
        email: "",
      });
      setAddDialogOpen(false);
    } catch (error) {
      console.error("Failed to add student:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.toLowerCase().includes("unauthorized")) {
        toast.error("You need admin privileges to perform this action");
      } else {
        toast.error("Failed to add student");
      }
    }
  };

  const handleEdit = async () => {
    if (!editingStudent || !editingStudent.student.name.trim()) {
      toast.error("Please enter a valid name");
      return;
    }
    if (editingStudent.student.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editingStudent.student.email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    try {
      await updateStudent.mutateAsync({
        oldName: editingStudent.oldName,
        newStudent: {
          ...editingStudent.student,
          name: editingStudent.student.name.trim(),
          totalFlightHours: BigInt(Math.floor(parseFloat(editingStudent.student.totalFlightHours) || 0)),
        },
      });
      toast.success("Student updated successfully");
      setEditingStudent(null);
      setEditDialogOpen(false);
    } catch (error) {
      console.error("Failed to update student:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.toLowerCase().includes("unauthorized")) {
        toast.error("You need admin privileges to perform this action");
      } else {
        toast.error("Failed to update student");
      }
    }
  };

  const handleDelete = async () => {
    if (!deletingStudent) return;
    try {
      await deleteStudent.mutateAsync(deletingStudent);
      toast.success("Student deleted successfully");
      setDeletingStudent(null);
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Failed to delete student:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.toLowerCase().includes("unauthorized")) {
        toast.error("You need admin privileges to perform this action");
      } else {
        toast.error("Failed to delete student");
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-display text-2xl">Students</CardTitle>
              <CardDescription>Manage student records</CardDescription>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={() => setAddDialogOpen(true)} 
                    className="gap-2"
                    disabled={!isAdmin}
                  >
                    {isAdmin && <Shield className="h-3.5 w-3.5" />}
                    <Plus className="h-4 w-4" />
                    Add Student
                  </Button>
                </TooltipTrigger>
                {!isAdmin && (
                  <TooltipContent>
                    <p className="flex items-center gap-2">
                      <Shield className="h-3.5 w-3.5" />
                      Admin access required
                    </p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="w-full md:w-1/3">
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : filteredStudents.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>License #</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.name}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell className="font-mono text-sm">{student.licenseNumber || "—"}</TableCell>
                      <TableCell className="text-sm">{student.phone || "—"}</TableCell>
                      <TableCell className="text-sm">{student.email || "—"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setEditingStudent({
                                      oldName: student.name,
                                      student: {
                                        name: student.name,
                                        licenseNumber: student.licenseNumber,
                                        medicalExpiry: student.medicalExpiry,
                                        totalFlightHours: String(student.totalFlightHours),
                                        phone: student.phone,
                                        email: student.email,
                                      },
                                    });
                                    setEditDialogOpen(true);
                                  }}
                                  disabled={!isAdmin}
                                  className="hover:bg-accent/50"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="flex items-center gap-2">
                                  {!isAdmin && <Shield className="h-3.5 w-3.5" />}
                                  {isAdmin ? "Edit student" : "Admin access required"}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setDeletingStudent(student.name);
                                    setDeleteDialogOpen(true);
                                  }}
                                  disabled={!isAdmin}
                                  className="hover:bg-destructive/10 hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="flex items-center gap-2">
                                  {!isAdmin && <Shield className="h-3.5 w-3.5" />}
                                  {isAdmin ? "Delete student" : "Admin access required"}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground text-center">
                  {searchTerm 
                    ? "No students match your search" 
                    : isAdmin 
                      ? "No students yet. Add your first student to get started!" 
                      : "No students available yet. Contact an admin to add them."}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
            <DialogDescription>Enter the student information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="studentName">Student Name *</Label>
              <Input
                id="studentName"
                placeholder="John Doe"
                value={newStudent.name}
                onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="licenseNumber">License Number</Label>
              <Input
                id="licenseNumber"
                placeholder="PPL12345"
                value={newStudent.licenseNumber}
                onChange={(e) => setNewStudent({ ...newStudent, licenseNumber: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="medicalExpiry">Medical Expiry Date</Label>
              <Input
                id="medicalExpiry"
                type="date"
                value={newStudent.medicalExpiry}
                onChange={(e) => setNewStudent({ ...newStudent, medicalExpiry: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalFlightHours">Total Flight Hours</Label>
              <Input
                id="totalFlightHours"
                type="number"
                min="0"
                step="0.1"
                placeholder="0"
                value={newStudent.totalFlightHours}
                onChange={(e) => setNewStudent({ ...newStudent, totalFlightHours: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 234-567-8900"
                value={newStudent.phone}
                onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={newStudent.email}
                onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={addStudent.isPending}>
              {addStudent.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Student"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>Update the student information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editStudentName">Student Name *</Label>
              <Input
                id="editStudentName"
                value={editingStudent?.student.name || ""}
                onChange={(e) =>
                  setEditingStudent((prev) =>
                    prev ? { ...prev, student: { ...prev.student, name: e.target.value } } : null
                  )
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editLicenseNumber">License Number</Label>
              <Input
                id="editLicenseNumber"
                value={editingStudent?.student.licenseNumber || ""}
                onChange={(e) =>
                  setEditingStudent((prev) =>
                    prev ? { ...prev, student: { ...prev.student, licenseNumber: e.target.value } } : null
                  )
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editMedicalExpiry">Medical Expiry Date</Label>
              <Input
                id="editMedicalExpiry"
                type="date"
                value={editingStudent?.student.medicalExpiry || ""}
                onChange={(e) =>
                  setEditingStudent((prev) =>
                    prev ? { ...prev, student: { ...prev.student, medicalExpiry: e.target.value } } : null
                  )
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editTotalFlightHours">Total Flight Hours</Label>
              <Input
                id="editTotalFlightHours"
                type="number"
                min="0"
                step="0.1"
                value={editingStudent?.student.totalFlightHours || "0"}
                onChange={(e) =>
                  setEditingStudent((prev) =>
                    prev ? { ...prev, student: { ...prev.student, totalFlightHours: e.target.value } } : null
                  )
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editPhoneNumber">Phone Number</Label>
              <Input
                id="editPhoneNumber"
                type="tel"
                value={editingStudent?.student.phone || ""}
                onChange={(e) =>
                  setEditingStudent((prev) =>
                    prev ? { ...prev, student: { ...prev.student, phone: e.target.value } } : null
                  )
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editEmail">Email</Label>
              <Input
                id="editEmail"
                type="email"
                value={editingStudent?.student.email || ""}
                onChange={(e) =>
                  setEditingStudent((prev) =>
                    prev ? { ...prev, student: { ...prev.student, email: e.target.value } } : null
                  )
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={updateStudent.isPending}>
              {updateStudent.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Student"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Student</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deletingStudent}</strong>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteStudent.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteStudent.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
