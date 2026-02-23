"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, User, DollarSign, CreditCard, TrendingUp, TrendingDown, FileText, BarChart3, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const navSections = [
  {
    label: "Overview",
    items: [
      { href: "/", label: "Dashboard", icon: Home },
      { href: "/insights", label: "Insights", icon: BarChart3 },
    ],
  },
  {
    label: "Money",
    items: [
      { href: "/income", label: "Income", icon: TrendingUp },
      { href: "/expenses", label: "Expenses", icon: TrendingDown },
      { href: "/debts", label: "Debts", icon: FileText },
    ],
  },
  {
    label: "Net Worth",
    items: [
      { href: "/assets", label: "Assets", icon: DollarSign },
      { href: "/liabilities", label: "Liabilities", icon: CreditCard },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/profile", label: "Profile", icon: User },
    ],
  },
];

function NavLink({ href, label, icon: Icon, isActive }: { href: string; label: string; icon: typeof Home; isActive: boolean }) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center gap-1 px-4 py-3 transition-colors md:flex-row md:rounded-lg md:px-4 md:py-2.5 md:gap-3 ${isActive
        ? "text-blue-600 dark:text-blue-400 md:bg-blue-50 dark:md:bg-blue-900/20"
        : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        }`}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      <span className="text-xs font-medium md:text-sm">{label}</span>
    </Link>
  );
}

export default function Navigation() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const allNavItems = navSections.flatMap((s) => s.items);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white dark:bg-gray-900 md:relative md:border-t-0 md:border-r md:bg-transparent md:min-h-screen">
      <div className="flex justify-around md:flex-col md:justify-start md:p-4 md:gap-6 md:h-full">
        {/* Desktop: grouped sections */}
        {navSections.map((section) => (
          <div key={section.label} className="hidden md:block">
            <h3 className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {section.label}
            </h3>
            <div className="flex flex-col gap-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <NavLink
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    icon={item.icon}
                    isActive={isActive}
                  />
                );
              })}
            </div>
          </div>
        ))}

        {/* Mobile: flat list of all items */}
        <div className="flex md:hidden justify-around w-full py-1">
          {allNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                isActive={isActive}
              />
            );
          })}
          <button
            onClick={logout}
            className="flex flex-col items-center gap-1 px-2 py-3 transition-colors text-red-600"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-xs font-medium">Logout</span>
          </button>
        </div>

        {/* Desktop: logout at bottom */}
        <div className="hidden md:block mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={logout}
            className="flex flex-row w-full items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

