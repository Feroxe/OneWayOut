"use client";

import { useState, useEffect } from "react";
import { UserProfile, DailyMood } from "@/types";
import { storage } from "@/lib/storage";
import { Smile, Calendar, TrendingUp } from "lucide-react";
import { format } from "date-fns";

const moods: Array<{ emoji: "😊" | "😐" | "😔"; label: string; description: string }> = [
  { emoji: "😊", label: "Great", description: "Feeling positive and optimistic" },
  { emoji: "😐", label: "Okay", description: "Doing fine, steady progress" },
  { emoji: "😔", label: "Struggling", description: "Finding it challenging" },
];

export default function MoodTracker() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [selectedMood, setSelectedMood] = useState<"😊" | "😐" | "😔" | null>(null);
  const [recentMoods, setRecentMoods] = useState<DailyMood[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const userProfile = await storage.getProfile();
    setProfile(userProfile);
    
    // Load recent moods (last 7 days)
    // Note: This would need to be implemented in storage.ts if not already available
    setRecentMoods([]);
    setIsLoading(false);
  };

  const handleMoodSelect = async (mood: "😊" | "😐" | "😔") => {
    if (!profile) return;
    
    setSelectedMood(mood);
    const updatedProfile = { ...profile, mood };
    await storage.saveProfile(updatedProfile);
    setProfile(updatedProfile);
    
    // Reload data
    await loadData();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
          <Smile className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mood Tracker</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">How are you feeling today?</p>
        </div>
      </div>

      {/* Current Mood Display */}
      {profile?.mood && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Current Mood</h2>
          <div className="flex items-center gap-4">
            <div className="text-6xl">{profile.mood}</div>
            <div>
              <p className="text-gray-900 dark:text-white font-medium">
                {moods.find(m => m.emoji === profile.mood)?.label}
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                {moods.find(m => m.emoji === profile.mood)?.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mood Selection */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Select Your Mood</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {moods.map((mood) => (
            <button
              key={mood.emoji}
              onClick={() => handleMoodSelect(mood.emoji)}
              className={`p-6 rounded-xl border-2 transition-all ${
                selectedMood === mood.emoji || profile?.mood === mood.emoji
                  ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-yellow-300 dark:hover:border-yellow-700"
              }`}
            >
              <div className="text-5xl mb-3">{mood.emoji}</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">{mood.label}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{mood.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Mood History */}
      {recentMoods.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Mood History</h2>
          </div>
          <div className="space-y-2">
            {recentMoods.map((moodEntry, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50"
              >
                <span className="text-gray-600 dark:text-gray-400">
                  {format(new Date(moodEntry.date), "MMM dd, yyyy")}
                </span>
                <span className="text-2xl">{moodEntry.mood}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mood Insights */}
      <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <TrendingUp className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Why Track Your Mood?</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Tracking your financial mood helps you understand patterns in your financial well-being. 
              It's a simple way to reflect on how you're feeling about your financial journey.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
