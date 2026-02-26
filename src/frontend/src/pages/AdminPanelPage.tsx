import React, { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetAllStudents,
  useGetAllInstructors,
  useGetAllAircraft,
  useGetAllExercises,
  useGetAllFlightLogs,
  useGetAllUsersWithProfiles,
  useAssignUserRole,
} from "../hooks/useQueries";
import { toast } from "sonner";
import {
  Users,
  UserCheck,
  Plane,
  BookOpen,
  Shield,
  ArrowRight,
  Loader2,
  AlertCircle,
  Download,
  HardDrive,
} from "lucide-react";
import { UserRole } from "../backend";
import type { AdminUserInfo } from "../backend";
import { exportAllDataToExcel } from "../utils/xlsxExport";

export default function AdminPanelPage() {
  const { data: students, isLoading: studentsLoading } = useGetAllStudents();
  const { data: instructors, isLoading: instructorsLoading } = useGetAllInstructors();
  const { data: aircraft, isLoading: aircraftLoading } = useGetAllAircraft();
  const { data: exercises, isLoading: exercisesLoading } = useGetAllExercises();
  const { data: flightLogs, isLoading: flightLogsLoading } = useGetAllFlightLogs();
  const { data: usersWithProfiles, isLoading: usersLoading } = useGetAllUsersWithProfiles();
  const assignUserRole = useAssignUserRole();

  const [changingRoleFor, setChangingRoleFor] = useState<string | null>(null);

  const isBackupLoading =
    studentsLoading || instructorsLoading || aircraftLoading || exercisesLoading || flightLogsLoading;

  const handleExportAllData = () => {
    exportAllDataToExcel(
      students ?? [],
      instructors ?? [],
      aircraft ?? [],
      exercises ?? [],
      flightLogs ?? [],
      `flight_school_backup_${new Date().toISOString().split("T")[0]}.xlsx`
    );
    toast.success("Backup exported successfully");
  };

  // Count admins to prevent removing the last admin
  const adminCount = useMemo(() => {
    if (!usersWithProfiles) return 0;
    return usersWithProfiles.filter((u) => u.role === UserRole.admin).length;
  }, [usersWithProfiles]);

  const handleRoleChange = async (user: AdminUserInfo, newRole: UserRole) => {
    // Prevent removing the last admin
    if (user.role === UserRole.admin && adminCount <= 1) {
      toast.error("Cannot change role: at least one admin must remain");
      return;
    }

    setChangingRoleFor(user.principal.toString());
    try {
      await assignUserRole.mutateAsync({ principal: user.principal, role: newRole });
      toast.success(`Role updated to ${newRole} successfully`);
    } catch (error) {
      console.error("Failed to update user role:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.toLowerCase().includes("unauthorized")) {
        toast.error("You need admin privileges to perform this action");
      } else {
        toast.error("Failed to update user role");
      }
    } finally {
      setChangingRoleFor(null);
    }
  };

  const truncatePrincipal = (principal: string) => {
    if (principal.length <= 20) return principal;
    return `${principal.slice(0, 10)}...${principal.slice(-8)}`;
  };

  const getRoleBadgeVariant = (role: UserRole): "default" | "secondary" | "outline" => {
    switch (role) {
      case UserRole.admin:
        return "default";
      case UserRole.user:
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-primary to-accent p-6 text-primary-foreground shadow-lg">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-amber-500/20 border-2 border-amber-500/40">
              <Shield className="h-7 w-7 text-amber-300" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold">Admin Panel</h1>
              <div className="flex items-center gap-2 mt-1">
                <Shield className="h-3.5 w-3.5 text-amber-300" />
                <span className="text-sm text-primary-foreground/90">Administrator Access Required</span>
              </div>
            </div>
          </div>
          <p className="text-primary-foreground/80">
            Manage users, roles, and system data
          </p>
        </div>
        <div className="absolute right-4 top-4 opacity-10">
          <Shield className="w-32 h-32" />
        </div>
      </div>

      {/* Overview Section */}
      <div>
        <h2 className="text-xl font-display font-semibold mb-4">System Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <OverviewCard
            title="Total Students"
            count={students?.length || 0}
            icon={Users}
            iconColor="text-primary"
            loading={studentsLoading}
          />
          <OverviewCard
            title="Total Instructors"
            count={instructors?.length || 0}
            icon={UserCheck}
            iconColor="text-accent"
            loading={instructorsLoading}
          />
          <OverviewCard
            title="Total Aircraft"
            count={aircraft?.length || 0}
            icon={Plane}
            iconColor="text-success"
            loading={aircraftLoading}
          />
          <OverviewCard
            title="Total Exercises"
            count={exercises?.length || 0}
            icon={BookOpen}
            iconColor="text-warning"
            loading={exercisesLoading}
          />
        </div>
      </div>

      {/* Quick Actions Section */}
      <div>
        <h2 className="text-xl font-display font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionCard
            title="Manage Students"
            description="Add, edit, or remove students"
            icon={Users}
            link="/students"
          />
          <QuickActionCard
            title="Manage Instructors"
            description="Add, edit, or remove instructors"
            icon={UserCheck}
            link="/instructors"
          />
          <QuickActionCard
            title="Manage Aircraft"
            description="Add, edit, or remove aircraft"
            icon={Plane}
            link="/aircraft"
          />
          <QuickActionCard
            title="Manage Exercises"
            description="Add, edit, or remove exercises"
            icon={BookOpen}
            link="/exercises"
          />
        </div>
      </div>

      {/* Data Backup & Recovery Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <HardDrive className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="font-display text-xl">Data Backup &amp; Recovery</CardTitle>
              <CardDescription>
                Download a complete backup of all flight school data as an Excel file
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">
                Exports all students, instructors, aircraft, exercises, and flight logs into a
                single Excel file with separate sheets for each data type. Use this to create
                regular backups or migrate data.
              </p>
              {!isBackupLoading && (
                <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {students?.length ?? 0} students
                  </span>
                  <span className="flex items-center gap-1">
                    <UserCheck className="h-3 w-3" />
                    {instructors?.length ?? 0} instructors
                  </span>
                  <span className="flex items-center gap-1">
                    <Plane className="h-3 w-3" />
                    {aircraft?.length ?? 0} aircraft
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    {exercises?.length ?? 0} exercises
                  </span>
                  <span className="flex items-center gap-1">
                    <Download className="h-3 w-3" />
                    {flightLogs?.length ?? 0} flight logs
                  </span>
                </div>
              )}
            </div>
            <Button
              onClick={handleExportAllData}
              disabled={isBackupLoading}
              className="gap-2 shrink-0"
            >
              {isBackupLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading data…
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Export All Data to Excel
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* User Management Section */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-2xl">User Management</CardTitle>
          <CardDescription>
            Manage user roles and permissions. At least one admin must remain.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {usersLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : usersWithProfiles && usersWithProfiles.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Principal</TableHead>
                    <TableHead>Current Role</TableHead>
                    <TableHead className="text-right">Change Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersWithProfiles.map((user) => {
                    const principalStr = user.principal.toString();
                    const isLastAdmin = user.role === UserRole.admin && adminCount <= 1;
                    const isChanging = changingRoleFor === principalStr;

                    return (
                      <TableRow key={principalStr}>
                        <TableCell className="font-medium">
                          {user.profile.name}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="cursor-help">
                                  {truncatePrincipal(principalStr)}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs break-all">{principalStr}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(user.role)}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="inline-block">
                                  <Select
                                    value={user.role}
                                    onValueChange={(value) =>
                                      handleRoleChange(user, value as UserRole)
                                    }
                                    disabled={isLastAdmin || isChanging}
                                  >
                                    <SelectTrigger className="w-[140px]">
                                      {isChanging ? (
                                        <div className="flex items-center gap-2">
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                          <span>Updating...</span>
                                        </div>
                                      ) : (
                                        <SelectValue />
                                      )}
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value={UserRole.admin}>Admin</SelectItem>
                                      <SelectItem value={UserRole.user}>User</SelectItem>
                                      <SelectItem value={UserRole.guest}>Guest</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </TooltipTrigger>
                              {isLastAdmin && (
                                <TooltipContent>
                                  <div className="flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4" />
                                    <p>Cannot change role - at least one admin must remain</p>
                                  </div>
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground text-center">
                No users found. This shouldn't happen!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Overview Card Component
interface OverviewCardProps {
  title: string;
  count: number;
  icon: React.ElementType;
  iconColor: string;
  loading: boolean;
}

function OverviewCard({ title, count, icon: Icon, iconColor, loading }: OverviewCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <p className="text-3xl font-display font-bold">{count}</p>
        )}
      </CardContent>
      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-accent/10 to-transparent rounded-bl-full"></div>
    </Card>
  );
}

// Quick Action Card Component
interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  link: string;
}

function QuickActionCard({ title, description, icon: Icon, link }: QuickActionCardProps) {
  return (
    <Link to={link}>
      <Card className="group hover:shadow-md transition-all cursor-pointer hover:border-primary/50 h-full">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <Icon className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </div>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription className="text-sm">{description}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
