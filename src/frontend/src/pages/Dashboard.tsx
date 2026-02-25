import React from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetDailySummary,
  useGetMonthlySummary,
  useGetAircraftHours,
  useGetAllFlightLogs,
} from "../hooks/useQueries";
import { getCurrentDate, getCurrentMonth, formatDuration, minutesToDecimalHours, formatDateDisplay } from "../utils/timeUtils";
import { Plane, Clock, Calendar, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const today = getCurrentDate();
  const currentMonth = getCurrentMonth();

  const { data: dailySummary, isLoading: dailyLoading } = useGetDailySummary(today);
  const { data: monthlySummary, isLoading: monthlyLoading } = useGetMonthlySummary(currentMonth);
  const { data: aircraftHours, isLoading: aircraftLoading } = useGetAircraftHours();
  const { data: allLogs, isLoading: logsLoading } = useGetAllFlightLogs();

  const recentFlights = allLogs?.slice(-10).reverse() || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome header */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-primary to-accent p-6 text-primary-foreground">
        <div className="relative z-10">
          <h2 className="font-display text-2xl font-bold mb-1">Welcome Back</h2>
          <p className="text-primary-foreground/90">
            {formatDateDisplay(today)}
          </p>
        </div>
        <div className="absolute right-4 top-4 opacity-20">
          <Plane className="w-24 h-24" />
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Today's Flights"
          value={dailyLoading ? "..." : dailySummary?.totalFlights.toString() || "0"}
          icon={Plane}
          iconColor="text-primary"
          loading={dailyLoading}
        />
        <SummaryCard
          title="Today's Hours"
          value={dailyLoading ? "..." : minutesToDecimalHours(dailySummary?.totalHours || 0).toFixed(1)}
          icon={Clock}
          iconColor="text-accent"
          loading={dailyLoading}
        />
        <SummaryCard
          title="Month's Flights"
          value={monthlyLoading ? "..." : monthlySummary?.totalFlights.toString() || "0"}
          icon={Calendar}
          iconColor="text-success"
          loading={monthlyLoading}
        />
        <SummaryCard
          title="Month's Hours"
          value={monthlyLoading ? "..." : minutesToDecimalHours(monthlySummary?.totalHours || 0).toFixed(1)}
          icon={TrendingUp}
          iconColor="text-warning"
          loading={monthlyLoading}
        />
      </div>

      {/* Aircraft utilization */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display">Aircraft Utilization</CardTitle>
          <CardDescription>Total flight hours per aircraft</CardDescription>
        </CardHeader>
        <CardContent>
          {aircraftLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : aircraftHours && aircraftHours.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Registration</TableHead>
                  <TableHead className="text-right">Total Hours</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {aircraftHours.map((aircraft) => (
                  <TableRow key={aircraft.registration}>
                    <TableCell className="font-medium">
                      {aircraft.registration}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {minutesToDecimalHours(aircraft.totalHours).toFixed(1)} hrs
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No aircraft data available
            </p>
          )}
        </CardContent>
      </Card>

      {/* Recent flights */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display">Recent Flights</CardTitle>
          <CardDescription>Last 10 flight log entries</CardDescription>
        </CardHeader>
        <CardContent>
          {logsLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : recentFlights.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Instructor</TableHead>
                    <TableHead>Aircraft</TableHead>
                    <TableHead>Exercise</TableHead>
                    <TableHead className="text-right">Duration</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentFlights.map((log, index) => (
                    <TableRow key={index}>
                      <TableCell className="whitespace-nowrap">
                        {log.date}
                      </TableCell>
                      <TableCell>{log.studentName}</TableCell>
                      <TableCell>{log.instructorName}</TableCell>
                      <TableCell className="font-mono">
                        {log.aircraftRegistration}
                      </TableCell>
                      <TableCell>{log.exerciseName}</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatDuration(log.durationMinutes)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No flight logs available
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface SummaryCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  iconColor: string;
  loading: boolean;
}

function SummaryCard({ title, value, icon: Icon, iconColor, loading }: SummaryCardProps) {
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
          <Skeleton className="h-8 w-20" />
        ) : (
          <p className="text-3xl font-display font-bold">{value}</p>
        )}
      </CardContent>
      {/* Decorative corner accent */}
      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-accent/10 to-transparent rounded-bl-full"></div>
    </Card>
  );
}
