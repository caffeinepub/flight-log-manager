import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useGetAllExercises, useAddExercise, useUpdateExercise, useDeleteExercise, useIsCallerAdmin } from "../hooks/useQueries";
import type { Exercise } from "../backend";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, BookOpen, Loader2, Shield } from "lucide-react";

export default function ExercisesPage() {
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  
  const [newExercise, setNewExercise] = useState<Omit<Exercise, 'durationMinutes'> & { durationMinutes: string }>({
    name: "",
    description: "",
    durationMinutes: "60",
    difficultyLevel: "Beginner",
  });

  const [editing, setEditing] = useState<{ 
    oldName: string; 
    exercise: Omit<Exercise, 'durationMinutes'> & { durationMinutes: string }
  } | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const { data: exercises, isLoading } = useGetAllExercises();
  const { data: isAdmin } = useIsCallerAdmin();
  const add = useAddExercise();
  const update = useUpdateExercise();
  const del = useDeleteExercise();

  const filtered = useMemo(() => {
    if (!exercises) return [];
    if (!search) return exercises;
    return exercises.filter((e) => 
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.description.toLowerCase().includes(search.toLowerCase())
    );
  }, [exercises, search]);

  const handleAdd = async () => {
    if (!newExercise.name.trim()) return toast.error("Enter exercise name");
    try {
      await add.mutateAsync({
        ...newExercise,
        name: newExercise.name.trim(),
        durationMinutes: BigInt(Math.floor(parseFloat(newExercise.durationMinutes) || 0)),
      });
      toast.success("Exercise added");
      setNewExercise({
        name: "",
        description: "",
        durationMinutes: "60",
        difficultyLevel: "Beginner",
      });
      setAddOpen(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.toLowerCase().includes("unauthorized")) {
        toast.error("You need admin privileges to perform this action");
      } else {
        toast.error("Failed to add");
      }
    }
  };

  const handleEdit = async () => {
    if (!editing || !editing.exercise.name.trim()) return toast.error("Invalid name");
    try {
      await update.mutateAsync({ 
        oldName: editing.oldName, 
        newExercise: {
          ...editing.exercise,
          name: editing.exercise.name.trim(),
          durationMinutes: BigInt(Math.floor(parseFloat(editing.exercise.durationMinutes) || 0)),
        }
      });
      toast.success("Exercise updated");
      setEditing(null);
      setEditOpen(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.toLowerCase().includes("unauthorized")) {
        toast.error("You need admin privileges to perform this action");
      } else {
        toast.error("Failed to update");
      }
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await del.mutateAsync(deleting);
      toast.success("Exercise deleted");
      setDeleting(null);
      setDeleteOpen(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.toLowerCase().includes("unauthorized")) {
        toast.error("You need admin privileges to perform this action");
      } else {
        toast.error("Failed to delete");
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-display text-2xl">Training Exercises</CardTitle>
              <CardDescription>Manage flight training exercises</CardDescription>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={() => setAddOpen(true)} 
                    className="gap-2"
                    disabled={!isAdmin}
                  >
                    {isAdmin && <Shield className="h-3.5 w-3.5" />}
                    <Plus className="h-4 w-4" />
                    Add Exercise
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
            <Input placeholder="Search exercises..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full md:w-1/3" />
            {isLoading ? (
              <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
            ) : filtered.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((e) => (
                    <TableRow key={e.name}>
                      <TableCell className="font-medium">{e.name}</TableCell>
                      <TableCell className="text-sm max-w-md truncate">{e.description || "—"}</TableCell>
                      <TableCell className="text-sm">{String(e.durationMinutes)} min</TableCell>
                      <TableCell className="text-sm">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          e.difficultyLevel === "Beginner" ? "bg-green-100 text-green-800" :
                          e.difficultyLevel === "Intermediate" ? "bg-yellow-100 text-yellow-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {e.difficultyLevel}
                        </span>
                      </TableCell>
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
                                      oldName: e.name, 
                                      exercise: {
                                        name: e.name,
                                        description: e.description,
                                        durationMinutes: String(e.durationMinutes),
                                        difficultyLevel: e.difficultyLevel,
                                      }
                                    }); 
                                    setEditOpen(true); 
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
                                  {isAdmin ? "Edit exercise" : "Admin access required"}
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
                                    setDeleting(e.name); 
                                    setDeleteOpen(true); 
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
                                  {isAdmin ? "Delete exercise" : "Admin access required"}
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
                <BookOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  {search 
                    ? "No exercises match" 
                    : isAdmin 
                      ? "No exercises yet. Add your first exercise to get started!" 
                      : "No exercises available yet. Contact an admin to add them."}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Exercise</DialogTitle>
            <DialogDescription>Enter the exercise information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Exercise Name *</Label>
              <Input 
                id="name" 
                placeholder="Circuit Training" 
                value={newExercise.name} 
                onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                placeholder="Detailed description of the exercise..."
                rows={4}
                value={newExercise.description} 
                onChange={(e) => setNewExercise({ ...newExercise, description: e.target.value })} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="durationMinutes">Estimated Duration (minutes)</Label>
              <Input 
                id="durationMinutes" 
                type="number"
                min="0"
                step="5"
                placeholder="60" 
                value={newExercise.durationMinutes} 
                onChange={(e) => setNewExercise({ ...newExercise, durationMinutes: e.target.value })} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="difficultyLevel">Difficulty Level</Label>
              <Select 
                value={newExercise.difficultyLevel}
                onValueChange={(value) => setNewExercise({ ...newExercise, difficultyLevel: value })}
              >
                <SelectTrigger id="difficultyLevel">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={add.isPending}>{add.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Adding...</> : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Exercise</DialogTitle>
            <DialogDescription>Update the exercise information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editName">Exercise Name *</Label>
              <Input 
                id="editName" 
                value={editing?.exercise.name || ""} 
                onChange={(e) => setEditing((p) => p ? { ...p, exercise: { ...p.exercise, name: e.target.value } } : null)} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editDescription">Description</Label>
              <Textarea 
                id="editDescription" 
                rows={4}
                value={editing?.exercise.description || ""} 
                onChange={(e) => setEditing((p) => p ? { ...p, exercise: { ...p.exercise, description: e.target.value } } : null)} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editDurationMinutes">Estimated Duration (minutes)</Label>
              <Input 
                id="editDurationMinutes" 
                type="number"
                min="0"
                step="5"
                value={editing?.exercise.durationMinutes || "60"} 
                onChange={(e) => setEditing((p) => p ? { ...p, exercise: { ...p.exercise, durationMinutes: e.target.value } } : null)} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editDifficultyLevel">Difficulty Level</Label>
              <Select 
                value={editing?.exercise.difficultyLevel || "Beginner"}
                onValueChange={(value) => setEditing((p) => p ? { ...p, exercise: { ...p.exercise, difficultyLevel: value } } : null)}
              >
                <SelectTrigger id="editDifficultyLevel">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEdit} disabled={update.isPending}>{update.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Updating...</> : "Update"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Exercise</AlertDialogTitle>
            <AlertDialogDescription>Delete <strong>{deleting}</strong>? This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={del.isPending} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {del.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Deleting...</> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
