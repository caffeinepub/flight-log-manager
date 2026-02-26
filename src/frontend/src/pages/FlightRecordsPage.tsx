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
import { Badge } from "@/components/ui/badge";
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
  useGetAllInstructors,
  useGetAllExercises,
  useDeleteFlightLog,
} from "../hooks/useQueries";
import { formatDuration, minutesToDecimalHours } from "../utils/timeUtils";
import { exportFlightLogsToExcel, exportAllDataToExcel } from "../utils/xlsxExport";
import {
  Download,
  Database,
  Search,
  X,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Clock,
  ListFilter,
  Hash,
  Calendar,
  Plane,
  User,
  Users,
  BarChart2,
} from "lucide-react";
import { toast } from "sonner";
import EditFlightLogDialog from "../components/EditFlightLogDialog";
import ConfirmDialog from "../components/ConfirmDialog";
import type { FlightLog } from "../backend";

const ITEMS_PER_PAGE = 50;

// ─── Expanded detail row ────────────────────────────────────────────────────
interface DetailFieldProps {
  label: string;
  value: string;
}

function DetailField({ label, value }: DetailFieldProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
        {label}
      </span>
      <span className="text-sm font-medium break-all">{value || "—"}</span>
    </div>
  );
}

interface ExpandedRowProps {
  log: FlightLog;
  colSpan: number;
}

function ExpandedRow({ log, colSpan }: ExpandedRowProps) {
  return (
    <TableRow className="bg-muted/30 hover:bg-muted/30">
      <TableCell colSpan={colSpan} className="px-6 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <DetailField label="Flight ID" value={log.id.toString()} />
          <DetailField label="Date" value={log.date} />
          <DetailField label="Student" value={log.studentName} />
          <DetailField label="Instructor" value={log.instructorName} />
          <DetailField label="Aircraft" value={log.aircraftRegistration} />
          <DetailField label="Flight Type" value={log.flightType} />
          <DetailField label="Exercise" value={log.exerciseName} />
          <DetailField label="Takeoff" value={log.takeoffTime} />
          <DetailField label="Landing" value={log.landingTime} />
          <DetailField label="Duration" value={formatDuration(log.durationMinutes)} />
          <DetailField label="Landing Type" value={log.landingType} />
          <DetailField label="Landing Count" value={log.landingCount.toString()} />
        </div>
      </TableCell>
    </TableRow>
  );
}

// ─── Summary stat chip ────────────────────────────────────────────────────────
interface StatChipProps {
  icon: React.ElementType;
  label: string;
  value: string;
  variant?: "default" | "secondary" | "outline";
}

function StatChip({ icon: Icon, label, value, variant = "secondary" }: StatChipProps) {
  return (
    <Badge variant={variant} className="gap-1.5 px-3 py-1.5 text-sm font-medium">
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span className="text-muted-foreground">{label}:</span>
      <span>{value}</span>
    </Badge>
  );
}

// ─── Entity summary card ──────────────────────────────────────────────────────
interface EntitySummaryCardProps {
  name: string;
  hours: number;
  icon: React.ElementType;
}

function EntitySummaryCard({ name, hours, icon: Icon }: EntitySummaryCardProps) {
  return (
    <div className="flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm">
      <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <span className="truncate font-medium flex-1">{name}</span>
      <span className="shrink-0 font-mono text-muted-foreground">
        {hours.toFixed(1)}h
      </span>
    </div>
  );
}

// ─── Summary by Entity section ────────────────────────────────────────────────
interface SummaryByEntityProps {
  logs: FlightLog[];
}

function SummaryByEntity({ logs }: SummaryByEntityProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { aircraftSummary, studentSummary, instructorSummary } = useMemo(() => {
    const aircraftMap = new Map<string, number>();
    const studentMap = new Map<string, number>();
    const instructorMap = new Map<string, number>();

    for (const log of logs) {
      const mins = Number(log.durationMinutes);
      aircraftMap.set(log.aircraftRegistration, (aircraftMap.get(log.aircraftRegistration) ?? 0) + mins);
      studentMap.set(log.studentName, (studentMap.get(log.studentName) ?? 0) + mins);
      instructorMap.set(log.instructorName, (instructorMap.get(log.instructorName) ?? 0) + mins);
    }

    const toSortedHours = (map: Map<string, number>) =>
      Array.from(map.entries())
        .map(([name, mins]) => ({ name, hours: minutesToDecimalHours(mins) }))
        .sort((a, b) => b.hours - a.hours);

    return {
      aircraftSummary: toSortedHours(aircraftMap),
      studentSummary: toSortedHours(studentMap),
      instructorSummary: toSortedHours(instructorMap),
    };
  }, [logs]);

  if (logs.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base font-semibold">Summary by Entity</CardTitle>
            <Badge variant="outline" className="text-xs">
              {logs.length} {logs.length === 1 ? "flight" : "flights"}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen((prev) => !prev)}
            className="gap-1.5 text-xs"
          >
            {isOpen ? (
              <>
                <ChevronUp className="h-3.5 w-3.5" />
                Collapse
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5" />
                Expand
              </>
            )}
          </Button>
        </div>
        <CardDescription className="text-xs">
          Total hours per aircraft, student, and instructor for the current filtered view
        </CardDescription>
      </CardHeader>

      {isOpen && (
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Aircraft */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Plane className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Aircraft
                </span>
              </div>
              <div className="space-y-1">
                {aircraftSummary.length > 0 ? (
                  aircraftSummary.map((item) => (
                    <EntitySummaryCard key={item.name} name={item.name} hours={item.hours} icon={Plane} />
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground italic">No data</p>
                )}
              </div>
            </div>

            {/* Students */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <User className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Students
                </span>
              </div>
              <div className="space-y-1">
                {studentSummary.length > 0 ? (
                  studentSummary.map((item) => (
                    <EntitySummaryCard key={item.name} name={item.name} hours={item.hours} icon={User} />
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground italic">No data</p>
                )}
              </div>
            </div>

            {/* Instructors */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Users className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Instructors
                </span>
              </div>
              <div className="space-y-1">
                {instructorSummary.length > 0 ? (
                  instructorSummary.map((item) => (
                    <EntitySummaryCard key={item.name} name={item.name} hours={item.hours} icon={Users} />
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground italic">No data</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function FlightRecordsPage() {
  const [monthFilter, setMonthFilter] = useState("");
  const [studentFilter, setStudentFilter] = useState("");
  const [aircraftFilter, setAircraftFilter] = useState("");
  const [instructorFilter, setInstructorFilter] = useState("");
  const [flightTypeFilter, setFlightTypeFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingLog, setEditingLog] = useState<FlightLog | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [logToDelete, setLogToDelete] = useState<FlightLog | null>(null);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  const { data: allLogs, isLoading } = useGetAllFlightLogs();
  const { data: students } = useGetAllStudents();
  const { data: aircraft } = useGetAllAircraft();
  const { data: instructors } = useGetAllInstructors();
  const { data: exercises } = useGetAllExercises();
  const deleteMutation = useDeleteFlightLog();

  const filteredLogs = useMemo(() => {
    if (!allLogs) return [];

    return allLogs.filter((log) => {
      const matchesMonth = !monthFilter.trim() || log.date.startsWith(monthFilter.trim());
      const matchesStudent = studentFilter === "" || log.studentName === studentFilter;
      const matchesAircraft = aircraftFilter === "" || log.aircraftRegistration === aircraftFilter;
      const matchesInstructor = instructorFilter === "" || log.instructorName === instructorFilter;
      const matchesFlightType = flightTypeFilter === "" || log.flightType === flightTypeFilter;
      const matchesFromDate = !fromDate || log.date >= fromDate;
      const matchesToDate = !toDate || log.date <= toDate;

      return (
        matchesMonth &&
        matchesStudent &&
        matchesAircraft &&
        matchesInstructor &&
        matchesFlightType &&
        matchesFromDate &&
        matchesToDate
      );
    });
  }, [allLogs, monthFilter, studentFilter, aircraftFilter, instructorFilter, flightTypeFilter, fromDate, toDate]);

  // Summary stats derived from filteredLogs
  const totalHoursDecimal = useMemo(() => {
    const totalMinutes = filteredLogs.reduce(
      (acc, log) => acc + Number(log.durationMinutes),
      0
    );
    return minutesToDecimalHours(totalMinutes);
  }, [filteredLogs]);

  const hasActiveFilters =
    monthFilter.trim() !== "" ||
    studentFilter !== "" ||
    aircraftFilter !== "" ||
    instructorFilter !== "" ||
    flightTypeFilter !== "" ||
    fromDate !== "" ||
    toDate !== "";

  const handleReset = () => {
    setMonthFilter("");
    setStudentFilter("");
    setAircraftFilter("");
    setInstructorFilter("");
    setFlightTypeFilter("");
    setFromDate("");
    setToDate("");
    setCurrentPage(1);
    setExpandedRowId(null);
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
      setExpandedRowId(null);

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
    setExpandedRowId(null);
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
    setExpandedRowId(null);
  };

  const handleExport = () => {
    exportFlightLogsToExcel(
      filteredLogs,
      `flight_logs_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  const handleExportAll = () => {
    exportAllDataToExcel(
      students ?? [],
      instructors ?? [],
      aircraft ?? [],
      exercises ?? [],
      allLogs ?? [],
      `flight_school_all_data_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  const handleRowClick = (logId: string) => {
    setExpandedRowId((prev) => (prev === logId ? null : logId));
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

      {/* Filter card */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display">Search & Filter</CardTitle>
          <CardDescription>Find specific flight log entries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Row 1: existing entity filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Month filter */}
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

              {/* Student filter */}
              <div className="space-y-2">
                <Label htmlFor="studentFilter">Student</Label>
                <Select value={studentFilter} onValueChange={setStudentFilter}>
                  <SelectTrigger id="studentFilter">
                    <SelectValue placeholder="All students" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All students</SelectItem>
                    {students?.map((s) => (
                      <SelectItem key={s.name} value={s.name}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Aircraft filter */}
              <div className="space-y-2">
                <Label htmlFor="aircraftFilter">Aircraft</Label>
                <Select value={aircraftFilter} onValueChange={setAircraftFilter}>
                  <SelectTrigger id="aircraftFilter">
                    <SelectValue placeholder="All aircraft" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All aircraft</SelectItem>
                    {aircraft?.map((a) => (
                      <SelectItem key={a.registration} value={a.registration}>
                        {a.registration}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Instructor filter */}
              <div className="space-y-2">
                <Label htmlFor="instructorFilter">Instructor</Label>
                <Select value={instructorFilter} onValueChange={setInstructorFilter}>
                  <SelectTrigger id="instructorFilter">
                    <SelectValue placeholder="All instructors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All instructors</SelectItem>
                    {instructors?.map((i) => (
                      <SelectItem key={i.name} value={i.name}>
                        {i.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 2: Flight Type + Date Range filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Flight Type filter */}
              <div className="space-y-2">
                <Label htmlFor="flightTypeFilter">Flight Type</Label>
                <Select value={flightTypeFilter} onValueChange={setFlightTypeFilter}>
                  <SelectTrigger id="flightTypeFilter">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All types</SelectItem>
                    <SelectItem value="Solo">Solo</SelectItem>
                    <SelectItem value="Dual">Dual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* From Date */}
              <div className="space-y-2">
                <Label htmlFor="fromDate">From Date</Label>
                <Input
                  id="fromDate"
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>

              {/* To Date */}
              <div className="space-y-2">
                <Label htmlFor="toDate">To Date</Label>
                <Input
                  id="toDate"
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
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
                Export Filtered (.xlsx)
              </Button>
              <Button
                onClick={handleExportAll}
                disabled={!allLogs || allLogs.length === 0}
                size="sm"
                variant="outline"
                className="gap-2"
              >
                <Database className="h-4 w-4" />
                Export All Data (.xlsx)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary by Entity */}
      <SummaryByEntity logs={filteredLogs} />

      {/* Flight logs card */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display">
            Flight Logs
            {filteredLogs.length > 0 && (
              <span className="ml-2 text-muted-foreground font-normal text-base">
                ({filteredLogs.length}{" "}
                {filteredLogs.length === 1 ? "entry" : "entries"})
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
              {/* Summary stats bar */}
              <div className="flex flex-wrap gap-2 mb-4">
                <StatChip
                  icon={Hash}
                  label="Entries"
                  value={filteredLogs.length.toString()}
                />
                <StatChip
                  icon={Clock}
                  label="Total hours"
                  value={`${totalHoursDecimal.toFixed(1)} hrs`}
                />
                {monthFilter.trim() !== "" && (
                  <StatChip
                    icon={Calendar}
                    label="Month"
                    value={monthFilter.trim()}
                    variant="outline"
                  />
                )}
                {flightTypeFilter !== "" && (
                  <StatChip
                    icon={Plane}
                    label="Type"
                    value={flightTypeFilter}
                    variant="outline"
                  />
                )}
                {hasActiveFilters && (
                  <StatChip
                    icon={ListFilter}
                    label="Filters"
                    value="active"
                    variant="outline"
                  />
                )}
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8" />
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
                    {paginatedLogs.map((log) => {
                      const rowId = log.id.toString();
                      const isExpanded = expandedRowId === rowId;
                      const isPendingDelete =
                        deleteMutation.isPending && logToDelete?.id === log.id;

                      return (
                        <React.Fragment key={rowId}>
                          <TableRow
                            className={`cursor-pointer hover:bg-muted/50 transition-colors${
                              isPendingDelete ? " opacity-50" : ""
                            }${isExpanded ? " bg-muted/30" : ""}`}
                            onClick={() => handleRowClick(rowId)}
                          >
                            {/* Expand indicator */}
                            <TableCell className="pr-0 text-muted-foreground">
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {log.date}
                            </TableCell>
                            <TableCell>{log.studentName}</TableCell>
                            <TableCell>{log.instructorName}</TableCell>
                            <TableCell className="font-mono">
                              {log.aircraftRegistration}
                            </TableCell>
                            <TableCell>{log.flightType}</TableCell>
                            <TableCell>{log.exerciseName}</TableCell>
                            <TableCell className="font-mono">
                              {log.takeoffTime}
                            </TableCell>
                            <TableCell className="font-mono">
                              {log.landingTime}
                            </TableCell>
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
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit(log);
                                  }}
                                  disabled={deleteMutation.isPending}
                                  title="Edit flight log"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteClick(log);
                                  }}
                                  disabled={deleteMutation.isPending}
                                  title="Delete flight log"
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>

                          {isExpanded && (
                            <ExpandedRow log={log} colSpan={13} />
                          )}
                        </React.Fragment>
                      );
                    })}
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
