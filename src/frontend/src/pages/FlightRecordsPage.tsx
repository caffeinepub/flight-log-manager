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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetAllFlightLogs,
  useGetAllStudents,
  useGetAllAircraft,
  useDeleteFlightLog,
} from "../hooks/useQueries";
import { formatDuration } from "../utils/timeUtils";
import { exportToCSV } from "../utils/csvExport";
import { Download, Search, X, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import EditFlightLogDialog from "../components/EditFlightLogDialog";
import ConfirmDialog from "../components/ConfirmDialog";
import type { FlightLog } from "../backend";

const ITEMS_PER_PAGE = 50;

export default function FlightRecordsPage() {
  const [monthFilter, setMonthFilter] = useState("");
  const [studentFilter, setStudentFilter] = useState(" ");
  const [aircraftFilter, setAircraftFilter] = useState(" ");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingLog, setEditingLog] = useState<FlightLog | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [logToDelete, setLogToDelete] = useState<FlightLog | null>(null);

  const { data: allLogs, isLoading } = useGetAllFlightLogs();
  const { data: students } = useGetAllStudents();
  const { data: aircraft } = useGetAllAircraft();
  const deleteMutation = useDeleteFlightLog();

  const filteredLogs = useMemo(() => {
    if (!allLogs) return [];

    return allLogs.filter((log) => {
      const matchesMonth = !monthFilter.trim() || log.date.startsWith(monthFilter);
      const matchesStudent = studentFilter.trim() === " " || log.studentName === studentFilter;
      const matchesAircraft = aircraftFilter.trim() === " " || log.aircraftRegistration === aircraftFilter;

      return matchesMonth && matchesStudent && matchesAircraft;
    });
  }, [allLogs, monthFilter, studentFilter, aircraftFilter]);

  const hasActiveFilters = monthFilter.trim() !== "" || studentFilter.trim() !== " " || aircraftFilter.trim() !== " ";

  const handleReset = () => {
    setMonthFilter("");
    setStudentFilter(" ");
    setAircraftFilter(" ");
    setCurrentPage(1);
  };

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);
  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredLogs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredLogs, currentPage]);

  const handleEdit = (log: FlightLog) => {
    setEditingLog(log);
  };

  const handleDeleteClick = (log: FlightLog) => {
    setLogToDelete(log);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!logToDelete) return;

    try {
      await deleteMutation.mutateAsync(logToDelete.id);
      toast.success("Flight log deleted successfully");
      setDeleteDialogOpen(false);
      setLogToDelete(null);
      
      // Adjust current page if needed
      if (paginatedLogs.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete flight log");
    }
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  const handleExport = () => {
    exportToCSV(filteredLogs, `flight_logs_${new Date().toISOString().split("T")[0]}.csv`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <EditFlightLogDialog
        open={!!editingLog}
        onOpenChange={(open) => !open && setEditingLog(null)}
        log={editingLog}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Flight Log"
        description="Are you sure you want to delete this flight log? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive
      />

      <Card>
        <CardHeader>
          <CardTitle className="font-display">Search & Filter</CardTitle>
          <CardDescription>
            Find specific flight log entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monthFilter">Month (YYYY-MM)</Label>
                <Input
                  id="monthFilter"
                  type="text"
                  placeholder="2026-02"
                  value={monthFilter}
                  onChange={(e) => setMonthFilter(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="studentFilter">Student</Label>
                <Select value={studentFilter} onValueChange={setStudentFilter}>
                  <SelectTrigger id="studentFilter">
                    <SelectValue placeholder="All students" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=" ">All students</SelectItem>
                    {students?.map((s) => (
                      <SelectItem key={s.name} value={s.name}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="aircraftFilter">Aircraft</Label>
                <Select value={aircraftFilter} onValueChange={setAircraftFilter}>
                  <SelectTrigger id="aircraftFilter">
                    <SelectValue placeholder="All aircraft" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=" ">All aircraft</SelectItem>
                    {aircraft?.map((a) => (
                      <SelectItem key={a.registration} value={a.registration}>
                        {a.registration}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2">
              {hasActiveFilters && (
                <Button
                  onClick={handleReset}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Reset Filters
                </Button>
              )}
              <Button
                onClick={handleExport}
                disabled={filteredLogs.length === 0}
                size="sm"
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export to CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-display">
            Flight Logs
            {filteredLogs.length > 0 && (
              <span className="ml-2 text-muted-foreground font-normal text-base">
                ({filteredLogs.length} {filteredLogs.length === 1 ? "entry" : "entries"})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : filteredLogs.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Instructor</TableHead>
                      <TableHead>Aircraft</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Exercise</TableHead>
                      <TableHead>Takeoff</TableHead>
                      <TableHead>Landing</TableHead>
                      <TableHead className="text-right">Duration</TableHead>
                      <TableHead>Landing Type</TableHead>
                      <TableHead className="text-right">Count</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedLogs.map((log) => (
                      <TableRow 
                        key={log.id.toString()}
                        className={deleteMutation.isPending && logToDelete?.id === log.id ? "opacity-50" : ""}
                      >
                        <TableCell className="whitespace-nowrap">{log.date}</TableCell>
                        <TableCell>{log.studentName}</TableCell>
                        <TableCell>{log.instructorName}</TableCell>
                        <TableCell className="font-mono">
                          {log.aircraftRegistration}
                        </TableCell>
                        <TableCell>{log.flightType}</TableCell>
                        <TableCell>{log.exerciseName}</TableCell>
                        <TableCell className="font-mono">{log.takeoffTime}</TableCell>
                        <TableCell className="font-mono">{log.landingTime}</TableCell>
                        <TableCell className="text-right font-mono">
                          {formatDuration(log.durationMinutes)}
                        </TableCell>
                        <TableCell>{log.landingType}</TableCell>
                        <TableCell className="text-right">
                          {log.landingCount.toString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(log)}
                              disabled={deleteMutation.isPending}
                              title="Edit flight log"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(log)}
                              disabled={deleteMutation.isPending}
                              title="Delete flight log"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 px-2">
                  <p className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground text-center">
                {hasActiveFilters
                  ? "No flight logs match your filters"
                  : "No flight logs available"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
