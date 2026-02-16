"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { AuthSession } from "@/types";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: AuthSession | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: (googleUser: { email: string; name: string; picture?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function toAuthSession(session: { user: { id: string; email?: string }; expires_at?: number } | null): AuthSession | null {
  if (!session?.user) return null;
  return {
    userId: session.user.id,
    email: session.user.email ?? "",
    expiresAt: session.expires_at ? session.expires_at * 1000 : 0,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(toAuthSession(session));
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(toAuthSession(session));
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured()) {
      return { success: false, error: "Supabase not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local (same folder as package.json), then restart the dev server." };
    }
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        return { success: false, error: error.message === "Invalid login credentials" ? "Invalid email or password." : error.message };
      }
      setUser(toAuthSession(data.session));
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred during login.";
      const isNetwork = msg.toLowerCase().includes("fetch") || msg.toLowerCase().includes("network");
      return {
        success: false,
        error: isNetwork
          ? "Cannot reach Supabase. Check .env.local (NEXT_PUBLIC_SUPABASE_URL and anon key) and that the project is not paused."
          : msg,
      };
    }
  };

  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured()) {
      return { success: false, error: "Supabase not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local (same folder as package.json), then restart the dev server." };
    }
    try {
      if (password.length < 6) {
        return { success: false, error: "Password must be at least 6 characters long." };
      }
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      if (error) {
        const isRateLimit = error.message.toLowerCase().includes("too many") || error.message.includes("429");
        return {
          success: false,
          error: isRateLimit
            ? "Too many signup attempts. Please wait a few minutes and try again."
            : error.message,
        };
      }
      if (data.session) {
        setUser(toAuthSession(data.session));
      }
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred during registration.";
      const isRateLimit = msg.includes("429") || msg.toLowerCase().includes("too many");
      const isNetwork = msg.toLowerCase().includes("fetch") || msg.toLowerCase().includes("network");
      return {
        success: false,
        error: isRateLimit
          ? "Too many signup attempts. Please wait a few minutes and try again."
          : isNetwork
            ? "Cannot reach Supabase. Check .env.local and that your Supabase project is not paused."
            : msg,
      };
    }
  };

  const loginWithGoogle = async (_googleUser: { email: string; name: string; picture?: string }): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: "google" });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (error) {
      return { success: false, error: "An error occurred during Google login." };
    }
  };

  const logout = () => {
    supabase.auth.signOut();
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        loginWithGoogle,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
