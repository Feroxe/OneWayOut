"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import OnboardingForm from "@/components/OnboardingForm";
import ProtectedRoute from "@/components/ProtectedRoute";
import { storage } from "@/lib/storage";

export default function OnboardingPage() {
  const router = useRouter();

  useEffect(() => {
    const profile = storage.getProfile();
    if (profile && profile.onboardingCompleted) {
      router.push("/");
    }
  }, [router]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <OnboardingForm />
      </div>
    </ProtectedRoute>
  );
}

