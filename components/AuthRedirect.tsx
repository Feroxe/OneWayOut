"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { storage } from "@/lib/storage";

export default function AuthRedirect({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // Don't redirect if user is on registration page - let them complete the 8-step form
      if (pathname === "/register") {
        return;
      }
      
      // Check if onboarding is completed
      const profile = storage.getProfile();
      if (profile && profile.onboardingCompleted) {
        router.push("/");
      } else {
        // Only redirect to onboarding if not on register page
        if (pathname !== "/register") {
          router.push("/onboarding");
        }
      }
    }
  }, [isAuthenticated, isLoading, router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Allow authenticated users to stay on register page to complete the form
  if (isAuthenticated && pathname !== "/register") {
    return null;
  }

  return <>{children}</>;
}


