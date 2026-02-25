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
  useGetAllInstructors,
  useAddInstructor,
  useUpdateInstructor,
  useDeleteInstructor,
  useIsCallerAdmin,
} from "../hooks/useQueries";
import type { Instructor } from "../backend";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, UserCheck, Loader2, Shield } from "lucide-react";

export default function InstructorsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const [newInstructor, setNewInstructor] = useState<Instructor>({
    name: "",
    certificateNumber: "",
    rating: "",
    phone: "",
    email: "",
  });

  const [editing, setEditing] = useState<{ oldName: string; instructor: Instructor } | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const { data: instructors, isLoading } = useGetAllInstructors();
  const { data: isAdmin } = useIsCallerAdmin();
  const addInstructor = useAddInstructor();
  const updateInstructor = useUpdateInstructor();
  const deleteInstructor = useDeleteInstructor();

  const filtered = useMemo(() => {
    if (!instructors) return [];
    if (!searchTerm) return instructors;
    return instructors.filter((i) =>
      i.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [instructors, searchTerm]);

  const handleAdd = async () => {
    if (!newInstructor.name.trim()) return toast.error("Please enter a name");
    if (newInstructor.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newInstructor.email)) {
      return toast.error("Please enter a valid email address");
    }
    try {
      await addInstructor.mutateAsync({
        ...newInstructor,
        name: newInstructor.name.trim(),
      });
      toast.success("Instructor added successfully");
      setNewInstructor({
        name: "",
        certificateNumber: "",
        rating: "",
        phone: "",
        email: "",
      });
      setAddDialogOpen(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.toLowerCase().includes("unauthorized")) {
        toast.error("You need admin privileges to perform this action");
      } else {
        toast.error("Failed to add instructor");
      }
    }
  };

  const handleEdit = async () => {
    if (!editing || !editing.instructor.name.trim()) return toast.error("Please enter a valid name");
    if (editing.instructor.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editing.instructor.email)) {
      return toast.error("Please enter a valid email address");
    }
    try {
      await updateInstructor.mutateAsync({ 
        oldName: editing.oldName, 
        newInstructor: {
          ...editing.instructor,
          name: editing.instructor.name.trim(),
        }
      });
      toast.success("Instructor updated successfully");
      setEditing(null);
      setEditDialogOpen(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.toLowerCase().includes("unauthorized")) {
        toast.error("You need admin privileges to perform this action");
      } else {
        toast.error("Failed to update instructor");
      }
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await deleteInstructor.mutateAsync(deleting);
      toast.success("Instructor deleted successfully");
      setDeleting(null);
      setDeleteDialogOpen(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.toLowerCase().includes("unauthorized")) {
        toast.error("You need admin privileges to perform this action");
      } else {
        toast.error("Failed to delete instructor");
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-display text-2xl">Instructors</CardTitle>
              <CardDescription>Manage flight instructors</CardDescription>
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
                    Add Instructor
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
                placeholder="Search instructors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : filtered.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Certificate #</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((instructor) => (
                    <TableRow key={instructor.name}>
                      <TableCell className="font-medium">{instructor.name}</TableCell>
                      <TableCell className="font-mono text-sm">{instructor.certificateNumber || "—"}</TableCell>
                      <TableCell className="text-sm">{instructor.rating || "—"}</TableCell>
                      <TableCell className="text-sm">{instructor.phone || "—"}</TableCell>
                      <TableCell className="text-sm">{instructor.email || "—"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setEditing({ 
                                      oldName: instructor.name, 
                                      instructor: { ...instructor }
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
                                  {isAdmin ? "Edit instructor" : "Admin access required"}
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
                                    setDeleting(instructor.name);
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
                                  {isAdmin ? "Delete instructor" : "Admin access required"}
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
                <UserCheck className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground text-center">
                  {searchTerm 
                    ? "No instructors match your search" 
                    : isAdmin 
                      ? "No instructors yet. Add your first instructor to get started!" 
                      : "No instructors available yet. Contact an admin to add them."}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Instructor</DialogTitle>
            <DialogDescription>Enter the instructor information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Instructor Name *</Label>
              <Input 
                id="name" 
                placeholder="Jane Smith"
                value={newInstructor.name} 
                onChange={(e) => setNewInstructor({ ...newInstructor, name: e.target.value })} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="certificateNumber">Certificate Number</Label>
              <Input 
                id="certificateNumber" 
                placeholder="CFI123456"
                value={newInstructor.certificateNumber} 
                onChange={(e) => setNewInstructor({ ...newInstructor, certificateNumber: e.target.value })} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rating">Rating</Label>
              <Input 
                id="rating" 
                placeholder="CFI, CFII, MEI"
                value={newInstructor.rating} 
                onChange={(e) => setNewInstructor({ ...newInstructor, rating: e.target.value })} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone" 
                type="tel"
                placeholder="+1 234-567-8900"
                value={newInstructor.phone} 
                onChange={(e) => setNewInstructor({ ...newInstructor, phone: e.target.value })} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email"
                placeholder="jane@example.com"
                value={newInstructor.email} 
                onChange={(e) => setNewInstructor({ ...newInstructor, email: e.target.value })} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={addInstructor.isPending}>
              {addInstructor.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Adding...</> : "Add Instructor"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Instructor</DialogTitle>
            <DialogDescription>Update the instructor information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editName">Instructor Name *</Label>
              <Input
                id="editName"
                value={editing?.instructor.name || ""}
                onChange={(e) => setEditing((prev) => prev ? { ...prev, instructor: { ...prev.instructor, name: e.target.value } } : null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editCertificateNumber">Certificate Number</Label>
              <Input
                id="editCertificateNumber"
                value={editing?.instructor.certificateNumber || ""}
                onChange={(e) => setEditing((prev) => prev ? { ...prev, instructor: { ...prev.instructor, certificateNumber: e.target.value } } : null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editRating">Rating</Label>
              <Input
                id="editRating"
                value={editing?.instructor.rating || ""}
                onChange={(e) => setEditing((prev) => prev ? { ...prev, instructor: { ...prev.instructor, rating: e.target.value } } : null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editPhone">Phone Number</Label>
              <Input
                id="editPhone"
                type="tel"
                value={editing?.instructor.phone || ""}
                onChange={(e) => setEditing((prev) => prev ? { ...prev, instructor: { ...prev.instructor, phone: e.target.value } } : null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editEmail">Email</Label>
              <Input
                id="editEmail"
                type="email"
                value={editing?.instructor.email || ""}
                onChange={(e) => setEditing((prev) => prev ? { ...prev, instructor: { ...prev.instructor, email: e.target.value } } : null)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEdit} disabled={updateInstructor.isPending}>
              {updateInstructor.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Updating...</> : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Instructor</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleting}</strong>? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteInstructor.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteInstructor.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Deleting...</> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
