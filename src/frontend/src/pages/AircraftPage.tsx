import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useGetAllAircraft, useAddAircraft, useUpdateAircraft, useDeleteAircraft, useIsCallerAdmin } from "../hooks/useQueries";
import type { Aircraft } from "../backend";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Plane, Loader2, Shield } from "lucide-react";

export default function AircraftPage() {
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  
  const [newAircraft, setNewAircraft] = useState<Omit<Aircraft, 'totalAirframeHours' | 'hourlyRate'> & { totalAirframeHours: string; hourlyRate: string }>({
    registration: "",
    makeModel: "",
    totalAirframeHours: "0",
    lastMaintenanceDate: "",
    hourlyRate: "0",
  });

  const [editing, setEditing] = useState<{ 
    oldReg: string; 
    aircraft: Omit<Aircraft, 'totalAirframeHours' | 'hourlyRate'> & { totalAirframeHours: string; hourlyRate: string }
  } | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const { data: aircraft, isLoading } = useGetAllAircraft();
  const { data: isAdmin } = useIsCallerAdmin();
  const add = useAddAircraft();
  const update = useUpdateAircraft();
  const del = useDeleteAircraft();

  const filtered = useMemo(() => {
    if (!aircraft) return [];
    if (!search) return aircraft;
    return aircraft.filter((a) => 
      a.registration.toLowerCase().includes(search.toLowerCase()) ||
      a.makeModel.toLowerCase().includes(search.toLowerCase())
    );
  }, [aircraft, search]);

  const handleAdd = async () => {
    if (!newAircraft.registration.trim()) return toast.error("Please enter registration");
    try {
      await add.mutateAsync({
        ...newAircraft,
        registration: newAircraft.registration.trim().toUpperCase(),
        totalAirframeHours: BigInt(Math.floor(parseFloat(newAircraft.totalAirframeHours) || 0)),
        hourlyRate: BigInt(Math.floor(parseFloat(newAircraft.hourlyRate) || 0)),
      });
      toast.success("Aircraft added");
      setNewAircraft({
        registration: "",
        makeModel: "",
        totalAirframeHours: "0",
        lastMaintenanceDate: "",
        hourlyRate: "0",
      });
      setAddOpen(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.toLowerCase().includes("unauthorized")) {
        toast.error("You need admin privileges to perform this action");
      } else {
        toast.error("Failed to add aircraft");
      }
    }
  };

  const handleEdit = async () => {
    if (!editing || !editing.aircraft.registration.trim()) return toast.error("Invalid registration");
    try {
      await update.mutateAsync({ 
        oldReg: editing.oldReg, 
        newAircraft: {
          ...editing.aircraft,
          registration: editing.aircraft.registration.trim().toUpperCase(),
          totalAirframeHours: BigInt(Math.floor(parseFloat(editing.aircraft.totalAirframeHours) || 0)),
          hourlyRate: BigInt(Math.floor(parseFloat(editing.aircraft.hourlyRate) || 0)),
        }
      });
      toast.success("Aircraft updated");
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
      toast.success("Aircraft deleted");
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
              <CardTitle className="font-display text-2xl">Aircraft</CardTitle>
              <CardDescription>Manage aircraft fleet</CardDescription>
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
                    Add Aircraft
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
            <Input placeholder="Search aircraft..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full md:w-1/3" />
            {isLoading ? (
              <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
            ) : filtered.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Registration</TableHead>
                    <TableHead>Make/Model</TableHead>
                    <TableHead>Airframe Hours</TableHead>
                    <TableHead>Last Maintenance</TableHead>
                    <TableHead>Hourly Rate</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((a) => (
                    <TableRow key={a.registration}>
                      <TableCell className="font-medium font-mono">{a.registration}</TableCell>
                      <TableCell className="text-sm">{a.makeModel || "—"}</TableCell>
                      <TableCell className="text-sm">{String(a.totalAirframeHours)}h</TableCell>
                      <TableCell className="text-sm">{a.lastMaintenanceDate || "—"}</TableCell>
                      <TableCell className="text-sm">${String(a.hourlyRate)}/hr</TableCell>
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
                                      oldReg: a.registration, 
                                      aircraft: {
                                        registration: a.registration,
                                        makeModel: a.makeModel,
                                        totalAirframeHours: String(a.totalAirframeHours),
                                        lastMaintenanceDate: a.lastMaintenanceDate,
                                        hourlyRate: String(a.hourlyRate),
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
                                  {isAdmin ? "Edit aircraft" : "Admin access required"}
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
                                    setDeleting(a.registration); 
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
                                  {isAdmin ? "Delete aircraft" : "Admin access required"}
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
                <Plane className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  {search 
                    ? "No aircraft match" 
                    : isAdmin 
                      ? "No aircraft yet. Add your first aircraft to get started!" 
                      : "No aircraft available yet. Contact an admin to add them."}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Aircraft</DialogTitle>
            <DialogDescription>Enter the aircraft information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reg">Registration *</Label>
              <Input 
                id="reg" 
                placeholder="N12345" 
                value={newAircraft.registration} 
                onChange={(e) => setNewAircraft({ ...newAircraft, registration: e.target.value })} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="makeModel">Make/Model</Label>
              <Input 
                id="makeModel" 
                placeholder="Cessna 172" 
                value={newAircraft.makeModel} 
                onChange={(e) => setNewAircraft({ ...newAircraft, makeModel: e.target.value })} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalAirframeHours">Total Airframe Hours</Label>
              <Input 
                id="totalAirframeHours" 
                type="number"
                min="0"
                step="1"
                placeholder="0" 
                value={newAircraft.totalAirframeHours} 
                onChange={(e) => setNewAircraft({ ...newAircraft, totalAirframeHours: e.target.value })} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastMaintenanceDate">Last Maintenance Date</Label>
              <Input 
                id="lastMaintenanceDate" 
                type="date"
                value={newAircraft.lastMaintenanceDate} 
                onChange={(e) => setNewAircraft({ ...newAircraft, lastMaintenanceDate: e.target.value })} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
              <Input 
                id="hourlyRate" 
                type="number"
                min="0"
                step="1"
                placeholder="150" 
                value={newAircraft.hourlyRate} 
                onChange={(e) => setNewAircraft({ ...newAircraft, hourlyRate: e.target.value })} 
              />
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
            <DialogTitle>Edit Aircraft</DialogTitle>
            <DialogDescription>Update the aircraft information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editReg">Registration *</Label>
              <Input 
                id="editReg" 
                value={editing?.aircraft.registration || ""} 
                onChange={(e) => setEditing((p) => p ? { ...p, aircraft: { ...p.aircraft, registration: e.target.value } } : null)} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editMakeModel">Make/Model</Label>
              <Input 
                id="editMakeModel" 
                value={editing?.aircraft.makeModel || ""} 
                onChange={(e) => setEditing((p) => p ? { ...p, aircraft: { ...p.aircraft, makeModel: e.target.value } } : null)} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editTotalAirframeHours">Total Airframe Hours</Label>
              <Input 
                id="editTotalAirframeHours" 
                type="number"
                min="0"
                step="1"
                value={editing?.aircraft.totalAirframeHours || "0"} 
                onChange={(e) => setEditing((p) => p ? { ...p, aircraft: { ...p.aircraft, totalAirframeHours: e.target.value } } : null)} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editLastMaintenanceDate">Last Maintenance Date</Label>
              <Input 
                id="editLastMaintenanceDate" 
                type="date"
                value={editing?.aircraft.lastMaintenanceDate || ""} 
                onChange={(e) => setEditing((p) => p ? { ...p, aircraft: { ...p.aircraft, lastMaintenanceDate: e.target.value } } : null)} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editHourlyRate">Hourly Rate ($)</Label>
              <Input 
                id="editHourlyRate" 
                type="number"
                min="0"
                step="1"
                value={editing?.aircraft.hourlyRate || "0"} 
                onChange={(e) => setEditing((p) => p ? { ...p, aircraft: { ...p.aircraft, hourlyRate: e.target.value } } : null)} 
              />
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
            <AlertDialogTitle>Delete Aircraft</AlertDialogTitle>
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
