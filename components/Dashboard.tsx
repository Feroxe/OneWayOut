"use client";

import { useState, useEffect } from "react";
import { UserProfile, Asset } from "@/types";
import { storage } from "@/lib/storage";
import { Calendar, Smile, DollarSign, Wallet, ChevronLeft, ChevronRight, HelpCircle, ShoppingCart, FileText, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";
import { DailyMood } from "@/types";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

export default function Dashboard() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalDebt, setTotalDebt] = useState(0);
  const [monthlyMinimumPayments, setMonthlyMinimumPayments] = useState(0);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<"day" | "week" | "month">("month");
  const [dailyMoods, setDailyMoods] = useState<DailyMood[]>([]);
  const [selectedDateState, setSelectedDateState] = useState<Date>(new Date());
  const [onboardingData, setOnboardingData] = useState<{
    income: any[];
    expenses: any[];
    assets: any[];
    liabilities: any[];
  }>({ income: [], expenses: [], assets: [], liabilities: [] });

  useEffect(() => {
    const loadData = () => {
      const userProfile = storage.getProfile();
      setProfile(userProfile);

      const expenses = storage.getExpenses();
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyExpenses = expenses
        .filter((exp) => {
          const expDate = new Date(exp.date);
          return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
        })
        .reduce((sum, exp) => sum + exp.amount, 0);
      setTotalExpenses(monthlyExpenses);

      const debts = storage.getDebts();
      const totalDebtAmount = debts.reduce((sum, debt) => sum + debt.remainingAmount, 0);
      const totalMinPayments = debts.reduce((sum, debt) => sum + debt.minimumPayment, 0);
      setTotalDebt(totalDebtAmount);
      setMonthlyMinimumPayments(totalMinPayments);

      const loadedAssets = storage.getAssets();
      setAssets(loadedAssets);

      const loadedMoods = storage.getDailyMoods();
      setDailyMoods(loadedMoods);

      // Load onboarding data
      if (typeof window !== "undefined") {
        try {
          const income = JSON.parse(localStorage.getItem('onboarding_income') || '[]');
          const expenses = JSON.parse(localStorage.getItem('onboarding_expenses') || '[]');
          const assets = JSON.parse(localStorage.getItem('onboarding_assets') || '[]');
          const liabilities = JSON.parse(localStorage.getItem('onboarding_liabilities') || '[]');
          setOnboardingData({ income, expenses, assets, liabilities });
        } catch (e) {
          console.error("Error loading onboarding data", e);
        }
      }
    };

    loadData();
    // Refresh data every 5 seconds
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400 mb-4">Please set up your profile first.</p>
        <Link
          href="/profile"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go to Profile
        </Link>
      </div>
    );
  }

  const monthlyIncome = profile.monthlyIncome || 0;
  const availableAfterExpenses = monthlyIncome - totalExpenses - monthlyMinimumPayments;
  const savingsRate = monthlyIncome > 0 ? (availableAfterExpenses / monthlyIncome) * 100 : 0;

  // Calculate progress values for each button
  // Mood: Based on financial health (0-100)
  const moodProgress = Math.max(0, Math.min(100, savingsRate + 50));

  // Earn: Based on income goal from onboarding
  const earnTarget = profile.incomeGoals || monthlyIncome * 1.2;
  const earnProgress = earnTarget > 0
    ? Math.min(100, ((profile.lastIncome || monthlyIncome) / earnTarget) * 100)
    : 0;

  // Budget: Based on budget adherence (expenses vs budget)
  const budgetTarget = monthlyIncome * 0.8; // 80% of income as budget
  const budgetProgress = budgetTarget > 0
    ? Math.min(100, ((profile.lastExpenses || totalExpenses) / budgetTarget) * 100)
    : 0;

  // Calendar setup
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const getDaysArray = () => {
    const days = [];
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    return days;
  };

  const goToPrevious = () => {
    if (calendarView === "day") {
      setCurrentDate(new Date(year, month, currentDate.getDate() - 1));
    } else if (calendarView === "week") {
      setCurrentDate(new Date(year, month, currentDate.getDate() - 7));
    } else {
      setCurrentDate(new Date(year, month - 1, 1));
    }
  };

  const goToNext = () => {
    if (calendarView === "day") {
      setCurrentDate(new Date(year, month, currentDate.getDate() + 1));
    } else if (calendarView === "week") {
      setCurrentDate(new Date(year, month, currentDate.getDate() + 7));
    } else {
      setCurrentDate(new Date(year, month + 1, 1));
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get week days for week view
  const getWeekDays = () => {
    const day = currentDate.getDate();
    const startOfWeek = new Date(year, month, day - currentDate.getDay());
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDays.push(date);
    }
    return weekDays;
  };

  // Get day view hours
  const getDayHours = () => {
    const hours = [];
    for (let i = 0; i < 24; i++) {
      hours.push(i);
    }
    return hours;
  };

  const getLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getMoodForDate = (date: Date) => {
    const dateStr = getLocalDateString(date);
    return dailyMoods.find(m => m.date === dateStr)?.mood;
  };

  const handleMoodSelect = (mood: "😊" | "😐" | "😔") => {
    const dateStr = getLocalDateString(selectedDateState);
    storage.saveDailyMood({ date: dateStr, mood });
    // Reload moods
    setDailyMoods(storage.getDailyMoods());
  };

  const renderMonthView = () => (
    <div className="grid grid-cols-7 gap-2">
      {dayNames.map((day) => (
        <div key={day} className="text-center text-sm font-semibold text-gray-600 dark:text-gray-400 py-2">
          {day}
        </div>
      ))}
      {getDaysArray().map((day, index) => {
        const date = day ? new Date(year, month, day) : null;
        const mood = date ? getMoodForDate(date) : null;
        const isSelected = date && date.getDate() === selectedDateState.getDate() &&
          date.getMonth() === selectedDateState.getMonth() &&
          date.getFullYear() === selectedDateState.getFullYear();

        const moodColors = mood === "😊"
          ? "bg-green-100 dark:bg-green-900/30 border-green-500 ring-2 ring-green-500 ring-opacity-50"
          : mood === "😐"
            ? "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-500 ring-2 ring-yellow-500 ring-opacity-50"
            : mood === "😔"
              ? "bg-red-100 dark:bg-red-900/30 border-red-500 ring-2 ring-red-500 ring-opacity-50"
              : "";

        return (
          <div
            key={index}
            onClick={() => {
              if (date) {
                setSelectedDateState(date);
                setCurrentDate(date);
              }
            }}
            className={`text-center py-2 rounded-full relative cursor-pointer h-[50px] w-[50px] mx-auto flex items-center justify-center transition-all ${day === null
              ? ""
              : mood
                ? `${moodColors} font-bold`
                : isSelected
                  ? "bg-blue-100 dark:bg-blue-900 border-2 border-blue-600"
                  : day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
                    ? "bg-blue-50 dark:bg-gray-700 font-semibold border-2 border-transparent"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border-2 border-transparent"
              }`}
          >
            {day && (
              <span>{day}</span>
            )}
          </div>
        );
      })}
    </div >
  );

  const renderWeekView = () => {
    const weekDays = getWeekDays();
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-7 gap-2 mb-2">
          {dayNames.map((day) => (
            <div key={day} className="text-center text-sm font-semibold text-gray-600 dark:text-gray-400 py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((date, index) => {
            const isToday =
              date.getDate() === today.getDate() &&
              date.getMonth() === today.getMonth() &&
              date.getFullYear() === today.getFullYear();
            return (
              <div
                key={index}
                className={`text-center py-4 rounded min-h-[60px] ${isToday
                  ? "bg-blue-600 text-white font-semibold"
                  : "bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                  }`}
              >
                <div className="text-sm font-medium">{date.getDate()}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const hours = getDayHours();
    const isToday =
      currentDate.getDate() === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear();

    return (
      <div className="space-y-2">
        <div className={`text-center py-3 rounded mb-2 ${isToday ? "bg-blue-600 text-white" : "bg-gray-50 dark:bg-gray-700"
          }`}>
          <div className="text-lg font-semibold">{currentDate.getDate()}</div>
          <div className="text-sm">{monthNames[month]} {year}</div>
        </div>
        <div className="max-h-[400px] overflow-y-auto space-y-1">
          {hours.map((hour) => (
            <div
              key={hour}
              className="flex items-center gap-2 p-2 border-b border-gray-200 dark:border-gray-700"
            >
              <div className="text-sm text-gray-600 dark:text-gray-400 w-16">
                {hour.toString().padStart(2, "0")}:00
              </div>
              <div className="flex-1 text-sm text-gray-500 dark:text-gray-400">
                {/* Empty slot for events */}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const getViewTitle = () => {
    if (calendarView === "day") {
      return `${dayNames[currentDate.getDay()]}, ${monthNames[month]} ${currentDate.getDate()}, ${year}`;
    } else if (calendarView === "week") {
      const weekDays = getWeekDays();
      const start = weekDays[0];
      const end = weekDays[6];
      return `${monthNames[start.getMonth()]} ${start.getDate()} - ${monthNames[end.getMonth()]} ${end.getDate()}, ${year}`;
    } else {
      return `${monthNames[month]} ${year}`;
    }
  };

  return (
    <div className="space-y-8">
      {/* Logo */}
      <div className="flex justify-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">OneWayOut</h1>
      </div>

      {/* Calendar */}
      <div className="flex justify-center">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 w-full">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={goToPrevious}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Previous"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {getViewTitle()}
              </h2>
            </div>
            <button
              onClick={goToNext}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Next"
            >
              <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* View Toggle Buttons */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setCalendarView("day")}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${calendarView === "day"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
            >
              Day
            </button>
            <button
              onClick={() => setCalendarView("week")}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${calendarView === "week"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
            >
              Week
            </button>
            <button
              onClick={() => setCalendarView("month")}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${calendarView === "month"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
            >
              Month
            </button>
          </div>

          <button
            onClick={goToToday}
            className="w-full mb-4 text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Go to Today
          </button>

          {/* Calendar View Content */}
          {calendarView === "month" && renderMonthView()}
          {calendarView === "week" && renderWeekView()}
          {calendarView === "day" && renderDayView()}

          {/* Calendar Legend */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Mood Key</h4>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-100 border-green-500 ring-2 ring-green-500 ring-opacity-50"></div>
                <span className="text-sm text-gray-600 dark:text-gray-300">Great</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-yellow-100 border-yellow-500 ring-2 ring-yellow-500 ring-opacity-50"></div>
                <span className="text-sm text-gray-600 dark:text-gray-300">Okay</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-100 border-red-500 ring-2 ring-red-500 ring-opacity-50"></div>
                <span className="text-sm text-gray-600 dark:text-gray-300">Stressed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mood Selector Buttons */}
      <div className="flex flex-col items-center gap-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          How was your day? ({selectedDateState.toLocaleDateString()})
        </h3>
        <div className="flex gap-4">
          <button
            onClick={() => handleMoodSelect("😊")}
            className={`p-4 rounded-full text-4xl hover:scale-110 transition-transform ${getMoodForDate(selectedDateState) === "😊" ? "bg-green-100 ring-4 ring-green-400" : "bg-gray-100 dark:bg-gray-800 hover:bg-green-50"}`}
            title="Great"
          >
            😊
          </button>
          <button
            onClick={() => handleMoodSelect("😐")}
            className={`p-4 rounded-full text-4xl hover:scale-110 transition-transform ${getMoodForDate(selectedDateState) === "😐" ? "bg-yellow-100 ring-4 ring-yellow-400" : "bg-gray-100 dark:bg-gray-800 hover:bg-yellow-50"}`}
            title="Okay"
          >
            😐
          </button>
          <button
            onClick={() => handleMoodSelect("😔")}
            className={`p-4 rounded-full text-4xl hover:scale-110 transition-transform ${getMoodForDate(selectedDateState) === "😔" ? "bg-red-100 ring-4 ring-red-400" : "bg-gray-100 dark:bg-gray-800 hover:bg-red-50"}`}
            title="Stressed"
          >
            😔
          </button>
        </div>
      </div>

      {/* Updates Heading */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Updates</h2>
      </div>

      {/* Financial Overview Cards */}
      {profile.onboardingCompleted && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Capital / Assets</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${(profile.capital || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Debts</p>
                  <p className="text-2xl font-bold text-orange-600">
                    ${(profile.debts || totalDebt || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <TrendingDown className="h-8 w-8 text-orange-600" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Last Income</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ${(profile.lastIncome || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Last Expenses</p>
                  <p className="text-2xl font-bold text-red-600">
                    ${(profile.lastExpenses || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <Wallet className="h-8 w-8 text-red-600" />
              </div>
            </div>
          </div>

          {/* Net Worth Card */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Net Worth</p>
                <p className="text-3xl font-bold">
                  ${((profile.capital || 0) - (profile.debts || totalDebt || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-sm mt-2 opacity-80">
                  Assets: ${(profile.capital || 0).toLocaleString()} - Debts: ${(profile.debts || totalDebt || 0).toLocaleString()}
                </p>
              </div>
              <Wallet className="h-12 w-12 opacity-80" />
            </div>
          </div>
        </>
      )}



      {/* Mood Display */}
      {profile.onboardingCompleted && profile.mood && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Current Mood</h3>
          <div className="flex items-center gap-4">
            <div className="text-6xl">{profile.mood}</div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">
                {profile.mood === "😊" && "You're feeling great! Keep up the positive mindset."}
                {profile.mood === "😐" && "You're doing okay. Remember, progress takes time."}
                {profile.mood === "😔" && "Hang in there! Every step forward counts, no matter how small."}
              </p>
            </div>
          </div>
        </div>
      )}



      {/* Three Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Help me Button */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <button className="w-full flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all">
            <HelpCircle className="h-6 w-6" />
            <span className="text-lg font-semibold">Help me</span>
          </button>
        </div>

        {/* Spend Button */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <Link href="/expenses" className="block">
            <button className="w-full flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-lg hover:from-red-600 hover:to-rose-600 transition-all">
              <ShoppingCart className="h-6 w-6" />
              <span className="text-lg font-semibold">Spend</span>
            </button>
          </Link>
        </div>

        {/* Review debt Button */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <Link href="/debts" className="block">
            <button className="w-full flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-lg hover:from-indigo-600 hover:to-violet-600 transition-all">
              <FileText className="h-6 w-6" />
              <span className="text-lg font-semibold">Review debt</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Financial Profile Details */}
      {profile.onboardingCompleted && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Profile Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Income Chart */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Income Breakdown
              </h3>
              <div className="h-[300px] w-full flex items-center justify-center">
                {onboardingData.income.length > 0 ? (
                  <Pie
                    data={{
                      labels: onboardingData.income.map(i => i.incomeType),
                      datasets: [{
                        data: onboardingData.income.map(i => (i.personal || 0) + (i.spouse || 0)),
                        backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'],
                        borderWidth: 0,
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'bottom' }
                      }
                    }}
                  />
                ) : (
                  <p className="text-gray-500">No income data available</p>
                )}
              </div>
            </div>

            {/* Expenses Chart */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Wallet className="h-5 w-5 text-orange-600" />
                Expenses Breakdown
              </h3>
              <div className="h-[300px] w-full flex items-center justify-center">
                {onboardingData.expenses.length > 0 ? (
                  <Pie
                    data={{
                      labels: onboardingData.expenses.map(e => e.expenseCategory),
                      datasets: [{
                        data: onboardingData.expenses.map(e => e.total || 0),
                        backgroundColor: ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6'],
                        borderWidth: 0,
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'bottom' }
                      }
                    }}
                  />
                ) : (
                  <p className="text-gray-500">No expense data available</p>
                )}
              </div>
            </div>

            {/* Assets Chart */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Assets Distribution
              </h3>
              <div className="h-[300px] w-full flex items-center justify-center">
                {onboardingData.assets.length > 0 ? (
                  <Bar
                    data={{
                      labels: onboardingData.assets.map(a => a.expenses),
                      datasets: [{
                        label: 'Value',
                        data: onboardingData.assets.map(a => a.total || 0),
                        backgroundColor: '#10b981',
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false }
                      },
                      scales: {
                        y: { beginAtZero: true }
                      }
                    }}
                  />
                ) : (
                  <p className="text-gray-500">No asset data available</p>
                )}
              </div>
            </div>

            {/* Liabilities Chart */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-600" />
                Liabilities Distribution
              </h3>
              <div className="h-[300px] w-full flex items-center justify-center">
                {onboardingData.liabilities.length > 0 ? (
                  <Bar
                    data={{
                      labels: onboardingData.liabilities.map(l => l.expenses),
                      datasets: [{
                        label: 'Amount',
                        data: onboardingData.liabilities.map(l => l.total || 0),
                        backgroundColor: '#ef4444',
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false }
                      },
                      scales: {
                        y: { beginAtZero: true }
                      }
                    }}
                  />
                ) : (
                  <p className="text-gray-500">No liability data available</p>
                )}
              </div>
            </div>
          </div>

          {/* 
           {/* Income Table */}
          {/* <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
             <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
               <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                 <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600">
                    <DollarSign className="h-5 w-5" />
                 </div>
                 Income Sources
               </h3>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-sm text-left">
                 <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                   <tr>
                     <th className="px-6 py-3">Type</th>
                     <th className="px-6 py-3">Source</th>
                     <th className="px-6 py-3">Name</th>
                     <th className="px-6 py-3 text-right">Total</th>
                   </tr>
                 </thead>
                 <tbody>
                   {onboardingData.income.length > 0 ? (
                     onboardingData.income.map((item, idx) => (
                       <tr key={idx} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                         <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{item.incomeType}</td>
                         <td className="px-6 py-4">{item.source}</td>
                         <td className="px-6 py-4">{item.name || "-"}</td>
                         <td className="px-6 py-4 text-right">N${((item.personal || 0) + (item.spouse || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                       </tr>
                     ))
                   ) : (
                     <tr>
                       <td colSpan={4} className="px-6 py-4 text-center text-gray-500">No income data recorded</td>
                     </tr>
                   )}
                 </tbody>
               </table>
             </div>
           </div> */}

          {/* Expenses Table */}
          {/* <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
             <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
               <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                 <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600">
                    <Wallet className="h-5 w-5" />
                 </div>
                 Expenses
               </h3>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-sm text-left">
                 <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                   <tr>
                     <th className="px-6 py-3">Category</th>
                     <th className="px-6 py-3">Type</th>
                     <th className="px-6 py-3">Name</th>
                     <th className="px-6 py-3 text-right">Total</th>
                   </tr>
                 </thead>
                 <tbody>
                   {onboardingData.expenses.length > 0 ? (
                     onboardingData.expenses.map((item, idx) => (
                       <tr key={idx} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                         <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{item.expenseCategory}</td>
                         <td className="px-6 py-4">{item.expenseType}</td>
                         <td className="px-6 py-4">{item.name || "-"}</td>
                         <td className="px-6 py-4 text-right">N${(item.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                       </tr>
                     ))
                   ) : (
                     <tr>
                       <td colSpan={4} className="px-6 py-4 text-center text-gray-500">No expense data recorded</td>
                     </tr>
                   )}
                 </tbody>
               </table>
             </div>
           </div> */}

          {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> */}
          {/* Assets Table */}
          {/* <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
               <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                 <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                   <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600">
                      <TrendingUp className="h-5 w-5" />
                   </div>
                   Assets
                 </h3>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left">
                   <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                     <tr>
                       <th className="px-6 py-3">Asset</th>
                       <th className="px-6 py-3 text-right">Value</th>
                     </tr>
                   </thead>
                   <tbody>
                     {onboardingData.assets.length > 0 ? (
                       onboardingData.assets.map((item, idx) => (
                         <tr key={idx} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                           <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                              {item.expenses}
                              {item.name && <span className="block text-xs text-gray-500">{item.name}</span>}
                           </td>
                           <td className="px-6 py-4 text-right">N${(item.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                         </tr>
                       ))
                     ) : (
                       <tr>
                         <td colSpan={2} className="px-6 py-4 text-center text-gray-500">No asset data recorded</td>
                       </tr>
                     )}
                   </tbody>
                 </table>
               </div>
             </div> */}

          {/* Liabilities Table */}
          {/* <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
               <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                 <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                   <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600">
                      <TrendingDown className="h-5 w-5" />
                   </div>
                   Liabilities
                 </h3>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left">
                   <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                     <tr>
                       <th className="px-6 py-3">Liability</th>
                       <th className="px-6 py-3 text-right">Amount</th>
                     </tr>
                   </thead>
                   <tbody>
                     {onboardingData.liabilities.length > 0 ? (
                       onboardingData.liabilities.map((item, idx) => (
                         <tr key={idx} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                           <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                              {item.expenses}
                              {item.name && <span className="block text-xs text-gray-500">{item.name}</span>}
                           </td>
                           <td className="px-6 py-4 text-right">N${(item.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                         </tr>
                       ))
                     ) : (
                       <tr>
                         <td colSpan={2} className="px-6 py-4 text-center text-gray-500">No liability data recorded</td>
                       </tr>
                     )}
                   </tbody>
                 </table>
               </div>
             </div> */}
          {/* </div> */}
        </div>
      )}

    </div>
  );
}

