import React from "react";
import { RouterProvider, createRouter, createRootRoute, createRoute, Outlet } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "./hooks/useQueries";
import { Toaster } from "@/components/ui/sonner";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";
import LoginPage from "./pages/LoginPage";
import ProfileSetup from "./components/ProfileSetup";
import Dashboard from "./pages/Dashboard";
import LogFlightPage from "./pages/LogFlightPage";
import FlightRecordsPage from "./pages/FlightRecordsPage";
import StudentsPage from "./pages/StudentsPage";
import InstructorsPage from "./pages/InstructorsPage";
import AircraftPage from "./pages/AircraftPage";
import ExercisesPage from "./pages/ExercisesPage";
import AdminPanelPage from "./pages/AdminPanelPage";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

function AuthenticatedLayout() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  if (isInitializing || (isAuthenticated && !isFetched)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <>
      <ProfileSetup open={showProfileSetup} />
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-6">
            <div className="container mx-auto">
              <Outlet />
            </div>
            <Footer />
          </main>
        </div>
      </div>
    </>
  );
}

const rootRoute = createRootRoute({
  component: AuthenticatedLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Dashboard,
});

const logFlightRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/log-flight",
  component: LogFlightPage,
});

const flightRecordsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/flight-records",
  component: FlightRecordsPage,
});

const studentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/students",
  component: StudentsPage,
});

const instructorsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/instructors",
  component: InstructorsPage,
});

const aircraftRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/aircraft",
  component: AircraftPage,
});

const exercisesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/exercises",
  component: ExercisesPage,
});

const adminPanelRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPanelPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  logFlightRoute,
  flightRecordsRoute,
  studentsRoute,
  instructorsRoute,
  aircraftRoute,
  exercisesRoute,
  adminPanelRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster />
    </QueryClientProvider>
  );
}
