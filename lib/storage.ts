import { UserProfile, Expense, Debt, AuthSession, Asset, DailyMood, Income, RegistrationExpense } from "@/types";
import { supabase } from "@/lib/supabase";

/** Get current Supabase user id (async). */
export async function getCurrentUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

/** Get session in app shape (from Supabase Auth). */
export async function getSession(): Promise<AuthSession | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;
  return {
    userId: session.user.id,
    email: session.user.email ?? "",
    expiresAt: session.expires_at ? session.expires_at * 1000 : 0,
  };
}

export const storage = {
  // Session (delegates to Supabase Auth)
  getSession,

  clearSession: async (): Promise<void> => {
    await supabase.auth.signOut();
  },

  getCurrentUserId,

  // Profile
  getProfile: async (): Promise<UserProfile | null> => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return null;
    const userId = authUser.id;
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    // If no profile exists (e.g. trigger didn't run or user created before migration), create one
    if (error && error.code === "PGRST116") {
      await supabase.from("profiles").upsert({
        id: userId,
        name: (authUser.user_metadata?.name as string) || "",
        email: authUser.email ?? "",
        phone: null,
        monthly_income: 0,
        savings_goal: null,
        created_at: new Date().toISOString(),
        mood: null,
        capital: null,
        debts: null,
        last_income: null,
        last_expenses: null,
        income_goals: null,
        saving_goals: null,
        onboarding_completed: false,
      });
      const { data: inserted } = await supabase.from("profiles").select("*").eq("id", userId).single();
      return inserted ? mapRowToProfile(inserted) : null;
    }
    if (error || !data) return null;
    return mapRowToProfile(data);
  },

  saveProfile: async (profile: UserProfile): Promise<void> => {
    const userId = await getCurrentUserId();
    if (!userId) return;
    await supabase.from("profiles").upsert({
      id: userId,
      name: profile.name,
      email: profile.email,
      phone: profile.phone ?? null,
      monthly_income: profile.monthlyIncome,
      savings_goal: profile.savingsGoal ?? null,
      created_at: profile.createdAt,
      mood: profile.mood ?? null,
      capital: profile.capital ?? null,
      debts: profile.debts ?? null,
      last_income: profile.lastIncome ?? null,
      last_expenses: profile.lastExpenses ?? null,
      income_goals: profile.incomeGoals ?? null,
      saving_goals: profile.savingGoals ?? null,
      onboarding_completed: profile.onboardingCompleted ?? false,
    });
  },

  // Expenses
  getExpenses: async (): Promise<Expense[]> => {
    const userId = await getCurrentUserId();
    if (!userId) return [];
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });
    if (error) return [];
    return (data ?? []).map(mapRowToExpense);
  },

  saveExpenses: async (expenses: Expense[]): Promise<void> => {
    const userId = await getCurrentUserId();
    if (!userId) return;
    await supabase.from("expenses").delete().eq("user_id", userId);
    if (expenses.length === 0) return;
    await supabase.from("expenses").insert(
      expenses.map((e) => ({
        id: e.id,
        user_id: userId,
        title: e.title,
        amount: e.amount,
        category: e.category,
        date: e.date,
        description: e.description ?? null,
      }))
    );
  },

  addExpense: async (expense: Expense): Promise<void> => {
    const userId = await getCurrentUserId();
    if (!userId) return;
    await supabase.from("expenses").insert({
      id: expense.id,
      user_id: userId,
      title: expense.title,
      amount: expense.amount,
      category: expense.category,
      date: expense.date,
      description: expense.description ?? null,
    });
  },

  deleteExpense: async (id: string): Promise<void> => {
    await supabase.from("expenses").delete().eq("id", id);
  },

  // Debts
  getDebts: async (): Promise<Debt[]> => {
    const userId = await getCurrentUserId();
    if (!userId) return [];
    const { data, error } = await supabase
      .from("debts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) return [];
    return (data ?? []).map(mapRowToDebt);
  },

  saveDebts: async (debts: Debt[]): Promise<void> => {
    const userId = await getCurrentUserId();
    if (!userId) return;
    await supabase.from("debts").delete().eq("user_id", userId);
    if (debts.length === 0) return;
    await supabase.from("debts").insert(
      debts.map((d) => ({
        id: d.id,
        user_id: userId,
        name: d.name,
        total_amount: d.totalAmount,
        remaining_amount: d.remainingAmount,
        interest_rate: d.interestRate,
        minimum_payment: d.minimumPayment,
        due_date: d.dueDate,
        type: d.type,
        created_at: d.createdAt,
      }))
    );
  },

  addDebt: async (debt: Debt): Promise<void> => {
    const userId = await getCurrentUserId();
    if (!userId) return;
    await supabase.from("debts").insert({
      id: debt.id,
      user_id: userId,
      name: debt.name,
      total_amount: debt.totalAmount,
      remaining_amount: debt.remainingAmount,
      interest_rate: debt.interestRate,
      minimum_payment: debt.minimumPayment,
      due_date: debt.dueDate,
      type: debt.type,
      created_at: debt.createdAt,
    });
  },

  updateDebt: async (id: string, updates: Partial<Debt>): Promise<void> => {
    const row: Record<string, unknown> = {};
    if (updates.remainingAmount !== undefined) row.remaining_amount = updates.remainingAmount;
    if (updates.minimumPayment !== undefined) row.minimum_payment = updates.minimumPayment;
    if (updates.name !== undefined) row.name = updates.name;
    if (updates.totalAmount !== undefined) row.total_amount = updates.totalAmount;
    if (updates.interestRate !== undefined) row.interest_rate = updates.interestRate;
    if (updates.dueDate !== undefined) row.due_date = updates.dueDate;
    if (Object.keys(row).length === 0) return;
    await supabase.from("debts").update(row).eq("id", id);
  },

  deleteDebt: async (id: string): Promise<void> => {
    await supabase.from("debts").delete().eq("id", id);
  },

  // Assets
  getAssets: async (): Promise<Asset[]> => {
    const userId = await getCurrentUserId();
    if (!userId) return [];
    const { data, error } = await supabase
      .from("assets")
      .select("*")
      .eq("user_id", userId);
    if (error) return [];
    return (data ?? []).map(mapRowToAsset);
  },

  saveAssets: async (assets: Asset[]): Promise<void> => {
    const userId = await getCurrentUserId();
    if (!userId) return;
    await supabase.from("assets").delete().eq("user_id", userId);
    if (assets.length === 0) return;
    await supabase.from("assets").insert(
      assets.map((a) => ({
        id: a.id,
        user_id: userId,
        category: a.category,
        type: a.type,
        name: a.name,
        personal: a.personal,
        spouse: a.spouse,
        points: a.points,
        interest_rate: a.interestRate,
        editable: a.editable ?? true,
      }))
    );
  },

  addAsset: async (asset: Asset): Promise<void> => {
    const userId = await getCurrentUserId();
    if (!userId) return;
    await supabase.from("assets").insert({
      id: asset.id,
      user_id: userId,
      category: asset.category,
      type: asset.type,
      name: asset.name,
      personal: asset.personal,
      spouse: asset.spouse,
      points: asset.points,
      interest_rate: asset.interestRate,
      editable: asset.editable ?? true,
    });
  },

  updateAsset: async (id: string, updates: Partial<Asset>): Promise<void> => {
    const row: Record<string, unknown> = {};
    if (updates.category !== undefined) row.category = updates.category;
    if (updates.type !== undefined) row.type = updates.type;
    if (updates.name !== undefined) row.name = updates.name;
    if (updates.personal !== undefined) row.personal = updates.personal;
    if (updates.spouse !== undefined) row.spouse = updates.spouse;
    if (updates.points !== undefined) row.points = updates.points;
    if (updates.interestRate !== undefined) row.interest_rate = updates.interestRate;
    if (updates.editable !== undefined) row.editable = updates.editable;
    if (Object.keys(row).length === 0) return;
    await supabase.from("assets").update(row).eq("id", id);
  },

  deleteAsset: async (id: string): Promise<void> => {
    await supabase.from("assets").delete().eq("id", id);
  },

  // Income (onboarding / registration income sources)
  getIncome: async (): Promise<Income[]> => {
    const userId = await getCurrentUserId();
    if (!userId) return [];
    const { data, error } = await supabase
      .from("income")
      .select("*")
      .eq("user_id", userId);
    if (error) return [];
    return (data ?? []).map(mapRowToIncome);
  },

  saveIncome: async (items: Income[]): Promise<void> => {
    const userId = await getCurrentUserId();
    if (!userId) return;
    await supabase.from("income").delete().eq("user_id", userId);
    if (items.length === 0) return;
    await supabase.from("income").insert(
      items.map((i) => ({
        id: i.id,
        user_id: userId,
        category: i.category,
        type: i.type,
        name: i.name,
        personal: i.personal,
        spouse: i.spouse,
        points: i.points,
        editable: i.editable ?? true,
      }))
    );
  },

  // Budget expenses (onboarding / registration expense categories)
  getBudgetExpenses: async (): Promise<RegistrationExpense[]> => {
    const userId = await getCurrentUserId();
    if (!userId) return [];
    const { data, error } = await supabase
      .from("budget_expenses")
      .select("*")
      .eq("user_id", userId);
    if (error) return [];
    return (data ?? []).map(mapRowToRegistrationExpense);
  },

  saveBudgetExpenses: async (items: RegistrationExpense[]): Promise<void> => {
    const userId = await getCurrentUserId();
    if (!userId) return;
    await supabase.from("budget_expenses").delete().eq("user_id", userId);
    if (items.length === 0) return;
    await supabase.from("budget_expenses").insert(
      items.map((e) => ({
        id: e.id,
        user_id: userId,
        category: e.category,
        type: e.type,
        name: e.name,
        personal: e.personal,
        spouse: e.spouse,
        points: e.points,
        editable: e.editable ?? true,
      }))
    );
  },

  // Daily Moods
  getDailyMoods: async (): Promise<DailyMood[]> => {
    const userId = await getCurrentUserId();
    if (!userId) return [];
    const { data, error } = await supabase
      .from("daily_moods")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });
    if (error) return [];
    return (data ?? []).map((r: { date: string; mood: string }) => ({ date: r.date, mood: r.mood as DailyMood["mood"] }));
  },

  saveDailyMood: async (mood: DailyMood): Promise<void> => {
    const userId = await getCurrentUserId();
    if (!userId) return;
    await supabase.from("daily_moods").upsert({
      user_id: userId,
      date: mood.date,
      mood: mood.mood,
    });
  },

  // Onboarding data (income, expenses, assets, liabilities)
  getOnboardingData: async (): Promise<{
    income: any[];
    expenses: any[];
    assets: any[];
    liabilities: any[];
  }> => {
    const userId = await getCurrentUserId();
    if (!userId) return { income: [], expenses: [], assets: [], liabilities: [] };
    const { data, error } = await supabase
      .from("onboarding_data")
      .select("income, expenses, assets, liabilities")
      .eq("user_id", userId)
      .single();
    if (error || !data)
      return { income: [], expenses: [], assets: [], liabilities: [] };
    return {
      income: (data.income as any[]) ?? [],
      expenses: (data.expenses as any[]) ?? [],
      assets: (data.assets as any[]) ?? [],
      liabilities: (data.liabilities as any[]) ?? [],
    };
  },

  saveOnboardingData: async (payload: {
    income: any[];
    expenses: any[];
    assets: any[];
    liabilities: any[];
  }): Promise<void> => {
    const userId = await getCurrentUserId();
    if (!userId) return;
    await supabase.from("onboarding_data").upsert({
      user_id: userId,
      income: payload.income,
      expenses: payload.expenses,
      assets: payload.assets,
      liabilities: payload.liabilities,
    });
  },
};

// Row mappers (Supabase snake_case -> app camelCase)
function mapRowToProfile(r: Record<string, unknown>): UserProfile {
  return {
    id: r.id as string,
    name: (r.name as string) ?? "",
    email: (r.email as string) ?? "",
    phone: r.phone as string | undefined,
    monthlyIncome: Number(r.monthly_income) ?? 0,
    savingsGoal: r.savings_goal != null ? Number(r.savings_goal) : undefined,
    createdAt: (r.created_at as string) ?? new Date().toISOString(),
    mood: r.mood as UserProfile["mood"],
    capital: r.capital != null ? Number(r.capital) : undefined,
    debts: r.debts != null ? Number(r.debts) : undefined,
    lastIncome: r.last_income != null ? Number(r.last_income) : undefined,
    lastExpenses: r.last_expenses != null ? Number(r.last_expenses) : undefined,
    incomeGoals: r.income_goals != null ? Number(r.income_goals) : undefined,
    savingGoals: r.saving_goals != null ? Number(r.saving_goals) : undefined,
    onboardingCompleted: Boolean(r.onboarding_completed),
  };
}

function mapRowToExpense(r: Record<string, unknown>): Expense {
  return {
    id: r.id as string,
    title: r.title as string,
    amount: Number(r.amount),
    category: r.category as Expense["category"],
    date: r.date as string,
    description: r.description as string | undefined,
  };
}

function mapRowToDebt(r: Record<string, unknown>): Debt {
  return {
    id: r.id as string,
    name: r.name as string,
    totalAmount: Number(r.total_amount),
    remainingAmount: Number(r.remaining_amount),
    interestRate: Number(r.interest_rate),
    minimumPayment: Number(r.minimum_payment),
    dueDate: r.due_date as string,
    type: r.type as Debt["type"],
    createdAt: r.created_at as string,
  };
}

function mapRowToAsset(r: Record<string, unknown>): Asset {
  return {
    id: r.id as string,
    category: r.category as Asset["category"],
    type: r.type as Asset["type"],
    name: r.name as string,
    personal: Number(r.personal),
    spouse: Number(r.spouse),
    points: Number(r.points),
    interestRate: Number(r.interest_rate),
    editable: r.editable as boolean | undefined,
  };
}

function mapRowToIncome(r: Record<string, unknown>): Income {
  return {
    id: r.id as string,
    category: r.category as Income["category"],
    type: r.type as Income["type"],
    name: (r.name as string) ?? "",
    personal: Number(r.personal),
    spouse: Number(r.spouse),
    points: Number(r.points),
    editable: r.editable as boolean | undefined,
  };
}

function mapRowToRegistrationExpense(r: Record<string, unknown>): RegistrationExpense {
  return {
    id: r.id as string,
    category: r.category as RegistrationExpense["category"],
    type: r.type as RegistrationExpense["type"],
    name: (r.name as string) ?? "",
    personal: Number(r.personal),
    spouse: Number(r.spouse),
    points: Number(r.points),
    editable: r.editable as boolean | undefined,
  };
}
