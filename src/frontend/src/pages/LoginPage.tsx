import React from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { Button } from "@/components/ui/button";
import { Plane, Loader2 } from "lucide-react";

export default function LoginPage() {
  const { login, loginStatus } = useInternetIdentity();

  const isLoggingIn = loginStatus === "logging-in";

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Login error:", err);
      if (err.message === "User is already authenticated") {
        window.location.reload();
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>

      {/* Login card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-card border border-border rounded-lg shadow-xl p-8 animate-fade-in">
          {/* Logo and branding */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-primary rounded-xl flex items-center justify-center shadow-glow">
                <Plane className="w-10 h-10 text-primary-foreground" />
              </div>
              <div className="absolute inset-0 bg-primary rounded-xl blur-xl opacity-50 -z-10"></div>
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="font-display font-bold text-3xl text-foreground mb-2">
              Flight Log System
            </h1>
            <p className="text-muted-foreground">
              Professional flight training management
            </p>
          </div>

          {/* Features list */}
          <div className="space-y-3 mb-8 text-sm">
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
              <span>Track student progress and flight hours</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
              <span>Manage instructors and aircraft</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
              <span>Generate comprehensive reports</span>
            </div>
          </div>

          {/* Login button */}
          <Button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="w-full h-12 font-medium"
            size="lg"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Authenticating...
              </>
            ) : (
              "Login with Internet Identity"
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center mt-6">
            Secure authentication powered by Internet Computer
          </p>
        </div>
      </div>
    </div>
  );
}
