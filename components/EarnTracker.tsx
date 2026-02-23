"use client";

import { useState, useEffect } from "react";
import { UserProfile } from "@/types";
import { storage } from "@/lib/storage";
import Link from "next/link";
import {
  Wallet,
  Banknote,
  GraduationCap,
  FileCheck,
  MessageSquareQuote,
  Star,
  Video,
  Heart,
  Calculator,
  Flag,
  Coins,
  CheckCircle,
} from "lucide-react";

type TaskId =
  | "update-budget"
  | "record-debt-payment"
  | "complete-course"
  | "add-existing-policy"
  | "request-quote"
  | "leave-feedback"
  | "register-webinar"
  | "book-life-counseling"
  | "book-financial-planning"
  | "report-abuse";

const TASKS: Array<{
  id: TaskId;
  label: string;
  points: number | null;
  icon: typeof Wallet;
  href?: string;
}> = [
  { id: "update-budget", label: "Update Budget", points: 50, icon: Wallet, href: "/budget" },
  { id: "record-debt-payment", label: "Record a debt payment", points: 100, icon: Banknote, href: "/debts" },
  { id: "complete-course", label: "Complete Course", points: 50, icon: GraduationCap },
  { id: "add-existing-policy", label: "Add existing policy", points: 500, icon: FileCheck },
  { id: "request-quote", label: "Request Quote", points: null, icon: MessageSquareQuote },
  { id: "leave-feedback", label: "Leave verified feedback", points: null, icon: Star },
  { id: "register-webinar", label: "Register for upcoming webinar", points: null, icon: Video },
  { id: "book-life-counseling", label: "Book life counseling appointment", points: null, icon: Heart },
  { id: "book-financial-planning", label: "Book financial planning appointment", points: null, icon: Calculator },
  { id: "report-abuse", label: "Report Abuse", points: null, icon: Flag },
];

export default function EarnTracker() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [completingId, setCompletingId] = useState<TaskId | null>(null);
  const [showClaimed, setShowClaimed] = useState<TaskId | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const userProfile = await storage.getProfile();
    setProfile(userProfile);
    setIsLoading(false);
  };

  const handleTaskClick = async (task: (typeof TASKS)[0]) => {
    if (task.points !== null && task.points > 0) {
      const confirmed = window.confirm(
        `Have you completed "${task.label}"? You will earn ${task.points} points.`
      );
      if (!confirmed) return;
      if (!profile) return;
      setCompletingId(task.id);
      const newPoints = (profile.userPoints ?? 0) + task.points;
      const updated = { ...profile, userPoints: newPoints };
      await storage.saveProfile(updated);
      setProfile(updated);
      setCompletingId(null);
      setShowClaimed(task.id);
      setTimeout(() => setShowClaimed(null), 2000);
    }
    // No-point tasks: could navigate or show toast
    if (task.href && task.points === null) {
      window.location.href = task.href;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-red-600" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  const userPoints = profile?.userPoints ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30">
          <Coins className="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Earn</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Complete tasks to earn points. Redeem them on the Spend screen.
          </p>
        </div>
      </div>

      {/* Points balance */}
      <div className="bg-gradient-to-r from-red-500 to-rose-600 rounded-xl p-5 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90">Your points</p>
            <p className="text-3xl font-bold">{userPoints.toLocaleString()}</p>
          </div>
          <Coins className="h-10 w-10 opacity-80" />
        </div>
        <Link
          href="/spend"
          className="mt-3 inline-block text-sm font-medium opacity-90 hover:underline"
        >
          Redeem on Spend →
        </Link>
      </div>

      {/* Task grid: icon on top of each button */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tasks</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {TASKS.map((task) => {
            const Icon = task.icon;
            const isCompleting = completingId === task.id;
            const justClaimed = showClaimed === task.id;
            const hasPoints = task.points !== null && task.points > 0;

            const buttonContent = (
              <>
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-2 ${
                    hasPoints
                      ? "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                  }`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white text-center line-clamp-2">
                  {task.label}
                </span>
                {hasPoints && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {task.points} points
                  </span>
                )}
                {justClaimed && (
                  <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400 mt-1">
                    <CheckCircle className="h-3.5 w-3.5" /> Claimed
                  </span>
                )}
              </>
            );

            return (
              <div key={task.id} className="flex flex-col items-center">
                <button
                  type="button"
                  disabled={isCompleting}
                  onClick={() => handleTaskClick(task)}
                  className="w-full flex flex-col items-center p-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-red-300 dark:hover:border-red-700 hover:bg-red-50/50 dark:hover:bg-red-900/20 transition-all disabled:opacity-60"
                >
                  {isCompleting ? (
                    <div className="flex flex-col items-center gap-2 py-2">
                      <div className="h-8 w-8 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
                      <span className="text-xs text-gray-500">Adding points...</span>
                    </div>
                  ) : (
                    buttonContent
                  )}
                </button>
                {task.href && (
                  <Link
                    href={task.href}
                    className="mt-1 text-xs text-red-600 dark:text-red-400 hover:underline"
                  >
                    Go to task →
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
