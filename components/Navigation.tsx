"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, User, DollarSign, CreditCard, TrendingUp, TrendingDown, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/income", label: "Income", icon: TrendingUp },
  { href: "/expenses", label: "Expenses", icon: TrendingDown },
  { href: "/assets", label: "Assets", icon: DollarSign },
  { href: "/liabilities", label: "Liabilities", icon: CreditCard },
  { href: "/profile", label: "Profile", icon: User },
];

export default function Navigation() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white dark:bg-gray-900 md:relative md:border-t-0 md:border-r md:bg-transparent">
      <div className="flex justify-around md:flex-col md:justify-start md:gap-2 md:p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-4 py-3 transition-colors md:flex-row md:rounded-lg md:px-4 md:py-3 ${isActive
                ? "text-blue-600 dark:text-blue-400 md:bg-blue-50 dark:md:bg-blue-900/20"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium md:text-sm">{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={logout}
          className="flex flex-col items-center gap-1 px-4 py-3 transition-colors md:flex-row md:rounded-lg md:px-4 md:py-3 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
        >
          <LogOut className="h-5 w-5" />
          <span className="text-xs font-medium md:text-sm">Logout</span>
        </button>
      </div>
    </nav>
  );
}

