"use client";

import { useState, useEffect } from "react";
import { UserProfile } from "@/types";
import { storage } from "@/lib/storage";
import { Lightbulb, TrendingUp, Target, Shield, BookOpen } from "lucide-react";

interface Tip {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: React.ReactNode;
}

export default function FinancialInsights() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tips, setTips] = useState<Tip[]>([]);

  useEffect(() => {
    const userProfile = storage.getProfile();
    setProfile(userProfile);

    const expenses = storage.getExpenses();
    const debts = storage.getDebts();
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalDebt = debts.reduce((sum, debt) => sum + debt.remainingAmount, 0);
    const monthlyIncome = userProfile?.monthlyIncome || 0;

    const generatedTips: Tip[] = [];

    // Budgeting tips
    if (monthlyIncome > 0) {
      const expenseRatio = totalExpenses / monthlyIncome;
      if (expenseRatio > 0.5) {
        generatedTips.push({
          id: "1",
          title: "Create a Budget",
          description:
            "Your expenses are high relative to your income. Create a detailed budget using the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings and debt repayment.",
          category: "Budgeting",
          icon: <Target className="h-6 w-6" />,
        });
      }
    }

    // Debt management tips
    if (totalDebt > 0) {
      const highInterestDebts = debts.filter((d) => d.interestRate > 15);
      if (highInterestDebts.length > 0) {
        generatedTips.push({
          id: "2",
          title: "Pay Off High-Interest Debt First",
          description:
            "Focus on paying off debts with interest rates above 15% first. This is often called the 'avalanche method' and can save you significant money in interest over time.",
          category: "Debt Management",
          icon: <TrendingUp className="h-6 w-6" />,
        });
      }

      if (debts.length > 3) {
        generatedTips.push({
          id: "3",
          title: "Consider Debt Consolidation",
          description:
            "You have multiple debts. Consider consolidating them into a single loan with a lower interest rate to simplify payments and potentially save money.",
          category: "Debt Management",
          icon: <Shield className="h-6 w-6" />,
        });
      }
    }

    // Savings tips
    if (userProfile && !userProfile.savingsGoal) {
      generatedTips.push({
        id: "4",
        title: "Set a Savings Goal",
        description:
          "Setting a specific savings goal helps you stay motivated. Aim to save at least 3-6 months of expenses as an emergency fund.",
        category: "Savings",
        icon: <Target className="h-6 w-6" />,
      });
    }

    // General tips
    generatedTips.push({
      id: "5",
      title: "Track Every Expense",
      description:
        "The first step to financial wellness is awareness. Track all your expenses, no matter how small, to understand where your money is going.",
      category: "General",
      icon: <BookOpen className="h-6 w-6" />,
    });

    generatedTips.push({
      id: "6",
      title: "Build an Emergency Fund",
      description:
        "Aim to save 3-6 months of living expenses in an easily accessible account. This provides a safety net for unexpected expenses or job loss.",
      category: "Savings",
      icon: <Shield className="h-6 w-6" />,
    });

    generatedTips.push({
      id: "7",
      title: "Review Your Expenses Regularly",
      description:
        "Review your spending monthly to identify patterns and areas where you can cut back. Small changes can add up to significant savings over time.",
      category: "Budgeting",
      icon: <TrendingUp className="h-6 w-6" />,
    });

    generatedTips.push({
      id: "8",
      title: "Automate Your Savings",
      description:
        "Set up automatic transfers to your savings account on payday. This 'pay yourself first' approach ensures you save before you spend.",
      category: "Savings",
      icon: <Target className="h-6 w-6" />,
    });

    setTips(generatedTips);
  }, []);

  const categories = Array.from(new Set(tips.map((tip) => tip.category)));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Lightbulb className="h-7 w-7 text-yellow-500" />
          Financial Wellness Tips
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Personalized advice to help you achieve your financial goals
        </p>
      </div>

      {!profile && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-blue-800 dark:text-blue-200">
            Complete your profile to get personalized financial insights!
          </p>
        </div>
      )}

      {categories.map((category) => {
        const categoryTips = tips.filter((tip) => tip.category === category);
        return (
          <div key={category} className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{category}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoryTips.map((tip) => (
                <div
                  key={tip.id}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 hover:border-blue-500 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-blue-600 dark:text-blue-400 flex-shrink-0">{tip.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{tip.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{tip.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}


