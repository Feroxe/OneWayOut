import { UserProfile, Expense, Debt, User, AuthSession, Asset, DailyMood } from "@/types";

const STORAGE_KEYS = {
  USERS: "financial_app_users",
  SESSION: "financial_app_session",
  PROFILE: "financial_app_profile",
  EXPENSES: "financial_app_expenses",
  DEBTS: "financial_app_debts",
  ASSETS: "financial_app_assets",
  MOODS: "financial_app_moods",
} as const;

export const storage = {
  // Authentication
  getUsers: (): User[] => {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  },

  saveUsers: (users: User[]): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  addUser: (user: User): void => {
    const users = storage.getUsers();
    users.push(user);
    storage.saveUsers(users);
  },

  getUserByEmail: (email: string): User | null => {
    const users = storage.getUsers();
    return users.find((u) => u.email === email) || null;
  },

  getSession: (): AuthSession | null => {
    if (typeof window === "undefined") return null;
    const data = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (!data) return null;
    const session: AuthSession = JSON.parse(data);
    // Check if session is expired
    if (session.expiresAt < Date.now()) {
      storage.clearSession();
      return null;
    }
    return session;
  },

  saveSession: (session: AuthSession): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
  },

  clearSession: (): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  },

  // Helper to get current user ID
  getCurrentUserId: (): string | null => {
    const session = storage.getSession();
    return session?.userId || null;
  },

  // Profile
  getProfile: (): UserProfile | null => {
    if (typeof window === "undefined") return null;
    const userId = storage.getCurrentUserId();
    if (!userId) return null;
    const data = localStorage.getItem(`${STORAGE_KEYS.PROFILE}_${userId}`);
    return data ? JSON.parse(data) : null;
  },

  saveProfile: (profile: UserProfile): void => {
    if (typeof window === "undefined") return;
    const userId = storage.getCurrentUserId();
    if (!userId) return;
    localStorage.setItem(`${STORAGE_KEYS.PROFILE}_${userId}`, JSON.stringify(profile));
  },

  // Expenses
  getExpenses: (): Expense[] => {
    if (typeof window === "undefined") return [];
    const userId = storage.getCurrentUserId();
    if (!userId) return [];
    const data = localStorage.getItem(`${STORAGE_KEYS.EXPENSES}_${userId}`);
    return data ? JSON.parse(data) : [];
  },

  saveExpenses: (expenses: Expense[]): void => {
    if (typeof window === "undefined") return;
    const userId = storage.getCurrentUserId();
    if (!userId) return;
    localStorage.setItem(`${STORAGE_KEYS.EXPENSES}_${userId}`, JSON.stringify(expenses));
  },

  addExpense: (expense: Expense): void => {
    const expenses = storage.getExpenses();
    expenses.push(expense);
    storage.saveExpenses(expenses);
  },

  deleteExpense: (id: string): void => {
    const expenses = storage.getExpenses();
    const filtered = expenses.filter((e) => e.id !== id);
    storage.saveExpenses(filtered);
  },

  // Debts
  getDebts: (): Debt[] => {
    if (typeof window === "undefined") return [];
    const userId = storage.getCurrentUserId();
    if (!userId) return [];
    const data = localStorage.getItem(`${STORAGE_KEYS.DEBTS}_${userId}`);
    return data ? JSON.parse(data) : [];
  },

  saveDebts: (debts: Debt[]): void => {
    if (typeof window === "undefined") return;
    const userId = storage.getCurrentUserId();
    if (!userId) return;
    localStorage.setItem(`${STORAGE_KEYS.DEBTS}_${userId}`, JSON.stringify(debts));
  },

  addDebt: (debt: Debt): void => {
    const debts = storage.getDebts();
    debts.push(debt);
    storage.saveDebts(debts);
  },

  updateDebt: (id: string, updates: Partial<Debt>): void => {
    const debts = storage.getDebts();
    const index = debts.findIndex((d) => d.id === id);
    if (index !== -1) {
      debts[index] = { ...debts[index], ...updates };
      storage.saveDebts(debts);
    }
  },

  deleteDebt: (id: string): void => {
    const debts = storage.getDebts();
    const filtered = debts.filter((d) => d.id !== id);
    storage.saveDebts(filtered);
  },

  // Assets
  getAssets: (): Asset[] => {
    if (typeof window === "undefined") return [];
    const userId = storage.getCurrentUserId();
    if (!userId) return [];
    const data = localStorage.getItem(`${STORAGE_KEYS.ASSETS}_${userId}`);
    return data ? JSON.parse(data) : [];
  },

  saveAssets: (assets: Asset[]): void => {
    if (typeof window === "undefined") return;
    const userId = storage.getCurrentUserId();
    if (!userId) return;
    localStorage.setItem(`${STORAGE_KEYS.ASSETS}_${userId}`, JSON.stringify(assets));
  },

  addAsset: (asset: Asset): void => {
    const assets = storage.getAssets();
    assets.push(asset);
    storage.saveAssets(assets);
  },

  updateAsset: (id: string, updates: Partial<Asset>): void => {
    const assets = storage.getAssets();
    const index = assets.findIndex((a) => a.id === id);
    if (index !== -1) {
      assets[index] = { ...assets[index], ...updates };
      storage.saveAssets(assets);
    }
  },

  deleteAsset: (id: string): void => {
    const assets = storage.getAssets();
    const filtered = assets.filter((a) => a.id !== id);
    storage.saveAssets(filtered);
  },

  // Daily Moods
  getDailyMoods: (): DailyMood[] => {
    if (typeof window === "undefined") return [];
    const userId = storage.getCurrentUserId();
    if (!userId) return [];
    const data = localStorage.getItem(`${STORAGE_KEYS.MOODS}_${userId}`);
    return data ? JSON.parse(data) : [];
  },

  saveDailyMood: (mood: DailyMood): void => {
    if (typeof window === "undefined") return;
    const userId = storage.getCurrentUserId();
    if (!userId) return;

    const moods = storage.getDailyMoods();
    const existingIndex = moods.findIndex((m) => m.date === mood.date);

    if (existingIndex >= 0) {
      moods[existingIndex] = mood;
    } else {
      moods.push(mood);
    }

    localStorage.setItem(`${STORAGE_KEYS.MOODS}_${userId}`, JSON.stringify(moods));
  },
};

