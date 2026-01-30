"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { storage } from "@/lib/storage";

export default function OnboardingCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const profile = storage.getProfile();
    if (!profile || !profile.onboardingCompleted) {
      router.push("/onboarding");
    }
  }, [router]);

  return <>{children}</>;
}

