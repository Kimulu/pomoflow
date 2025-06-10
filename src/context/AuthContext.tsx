"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  PropsWithChildren, // Import PropsWithChildren for better typing
} from "react";
import { postData, fetchData, putData } from "../pages/api/api";
import { AuthError } from "../utils/AuthError";
import { Task } from "../types";
interface User {
  _id: string;
  email: string;
  username: string;
  plan: string;
  trialStart: string | null;
  cycles: number;
  lastPomodoroDate: string | null;
  tasks: Task[];
  msg?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  incrementUserDailyCycles: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

// Add PropsWithChildren to the AuthProvider props type
export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const userData = await fetchData<User>("/auth/me");
      setUser(userData);
      setIsAuthenticated(true);
    } catch (err: unknown) {
      // Changed 'any' to 'unknown'
      if (err instanceof AuthError && err.status === 401) {
        // Expected for unauthenticated users
        // No need to set error or console.error for expected 401
      } else {
        console.error("AuthContext: Failed to fetch user:", err);
        // Type check 'err' to safely access 'message'
        setError(
          (err instanceof Error ? err.message : String(err)) ||
            "Failed to fetch user data."
        );
      }
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = useCallback(
    async (emailParam: string, passwordParam: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const loggedInUser = await postData<User>("/auth/login", {
          email: emailParam,
          password: passwordParam,
        });
        setUser(loggedInUser);
        setIsAuthenticated(true);
        setError(null);
      } catch (err: unknown) {
        // Changed 'any' to 'unknown'
        console.error("Login error:", err);
        setError(
          (err instanceof Error ? err.message : String(err)) ||
            "Login failed. Please check your credentials."
        );
        setIsAuthenticated(false);
        setUser(null);
        throw err; // Re-throw the error to be caught by login forms/components
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const register = useCallback(
    async (
      usernameParam: string,
      emailParam: string,
      passwordParam: string
    ) => {
      setIsLoading(true);
      setError(null);
      try {
        const registeredUser = await postData<User>("/auth/register", {
          username: usernameParam,
          email: emailParam,
          password: passwordParam,
        });
        setUser(registeredUser);
        setIsAuthenticated(true);
        setError(null);
      } catch (err: unknown) {
        // Changed 'any' to 'unknown'
        console.error("Registration error:", err);
        setError(
          (err instanceof Error ? err.message : String(err)) ||
            "Registration failed."
        );
        setIsAuthenticated(false);
        setUser(null);
        throw err; // Re-throw the error
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await postData("/auth/logout", {});
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    } catch (err: unknown) {
      // Changed 'any' to 'unknown'
      console.error("Logout error:", err);
      setError(
        (err instanceof Error ? err.message : String(err)) || "Logout failed."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const incrementUserDailyCycles = useCallback(async () => {
    // You might want to handle user being null here if it's possible
    // (e.g., if this function is called before user data is fully loaded)
    if (!isAuthenticated || !user?._id || !user?.username) {
      console.warn(
        "Attempted to increment cycles without authenticated user or missing username."
      );
      setError("User information incomplete for cycle update.");
      return;
    }
    setError(null);
    try {
      const updatedUser = await putData<User>("/users/cycles/increment", {
        username: user.username,
      });
      setUser(updatedUser);
    } catch (err: unknown) {
      // Changed 'any' to 'unknown'
      console.error("Error incrementing user cycles:", err);
      setError(
        (err instanceof Error ? err.message : String(err)) ||
          "Failed to update daily cycles."
      );
    }
  }, [isAuthenticated, user]); // Added 'user' to dependencies array

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        error,
        login,
        register,
        logout,
        incrementUserDailyCycles,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
