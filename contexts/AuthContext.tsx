"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { AuthSession, User } from "@/types";
import { storage } from "@/lib/storage";
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for existing session on mount
    const session = storage.getSession();
    setUser(session);
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const user = storage.getUserByEmail(email);
      if (!user) {
        return { success: false, error: "User not found. Please register first." };
      }

      if (user.password !== password) {
        return { success: false, error: "Invalid password." };
      }

      // Create session (expires in 7 days)
      const session: AuthSession = {
        userId: user.id,
        email: user.email,
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      };

      storage.saveSession(session);
      setUser(session);
      return { success: true };
    } catch (error) {
      return { success: false, error: "An error occurred during login." };
    }
  };

  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Check if user already exists
      const existingUser = storage.getUserByEmail(email);
      if (existingUser) {
        return { success: false, error: "Email already registered. Please login instead." };
      }

      // Validate password length
      if (password.length < 6) {
        return { success: false, error: "Password must be at least 6 characters long." };
      }

      // Create new user
      const newUser: User = {
        id: Date.now().toString(),
        email,
        password, // In production, hash this password
        name,
        createdAt: new Date().toISOString(),
      };

      storage.addUser(newUser);

      // Automatically log in after registration
      const session: AuthSession = {
        userId: newUser.id,
        email: newUser.email,
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      };

      storage.saveSession(session);
      setUser(session);
      return { success: true };
    } catch (error) {
      return { success: false, error: "An error occurred during registration." };
    }
  };

  const loginWithGoogle = async (googleUser: { email: string; name: string; picture?: string }): Promise<{ success: boolean; error?: string }> => {
    try {
      // Check if user already exists
      let user = storage.getUserByEmail(googleUser.email);
      
      if (!user) {
        // Create new user automatically for Google login
        const newUser: User = {
          id: Date.now().toString(),
          email: googleUser.email,
          password: "", // No password for Google users
          name: googleUser.name,
          createdAt: new Date().toISOString(),
        };
        storage.addUser(newUser);
        user = newUser;
      }

      // Create session (expires in 7 days)
      const session: AuthSession = {
        userId: user.id,
        email: user.email,
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      };

      storage.saveSession(session);
      setUser(session);
      return { success: true };
    } catch (error) {
      return { success: false, error: "An error occurred during Google login." };
    }
  };

  const logout = () => {
    storage.clearSession();
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

