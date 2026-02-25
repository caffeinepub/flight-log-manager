import React from "react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  Users,
  UserCheck,
  Plane,
  BookOpen,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsCallerAdmin } from "../hooks/useQueries";

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  isAdminOnly?: boolean;
}

const navItems: NavItem[] = [
  {
    to: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    to: "/log-flight",
    label: "Log Flight",
    icon: PlusCircle,
  },
  {
    to: "/flight-records",
    label: "Flight Records",
    icon: FileText,
  },
  {
    to: "/students",
    label: "Students",
    icon: Users,
  },
  {
    to: "/instructors",
    label: "Instructors",
    icon: UserCheck,
  },
  {
    to: "/aircraft",
    label: "Aircraft",
    icon: Plane,
  },
  {
    to: "/exercises",
    label: "Exercises",
    icon: BookOpen,
  },
];

const adminNavItems: NavItem[] = [
  {
    to: "/admin",
    label: "Admin Panel",
    icon: Shield,
    isAdminOnly: true,
  },
];

export default function Sidebar() {
  const location = useLocation();
  const { data: isAdmin } = useIsCallerAdmin();

  // Combine nav items based on admin status
  const allNavItems = isAdmin ? [...navItems, ...adminNavItems] : navItems;

  return (
    <aside className="w-64 border-r border-border bg-sidebar min-h-[calc(100vh-4rem)] sticky top-16">
      <nav className="p-4 space-y-1">
        {allNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;
          const isAdminItem = item.isAdminOnly === true;

          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-md transition-all group relative overflow-hidden",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isAdminItem ? "ring-2 ring-amber-500/30 bg-gradient-to-r from-amber-500/10 to-orange-500/10" : ""
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-sidebar-primary-foreground"></div>
              )}
              <Icon
                className={cn(
                  "h-5 w-5 transition-transform group-hover:scale-110",
                  isActive && "drop-shadow-glow",
                  isAdminItem ? "text-amber-500 dark:text-amber-400" : ""
                )}
              />
              <span className={cn(
                "font-medium",
                isAdminItem ? "text-amber-600 dark:text-amber-300" : ""
              )}>
                {item.label}
              </span>
              {isAdminItem && (
                <Shield className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400 ml-auto" />
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
