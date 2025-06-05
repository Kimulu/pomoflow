// @ts-nocheck
"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
// Removed useRouter import since it's not directly used within the provider for redirects anymore
// And added AuthError import explicitly
import { postData, fetchData, putData } from "../pages/api/api";
import { AuthError } from "../utils/AuthError"; // Ensure this path is correct, e.g., ../utils/AuthError

interface User {
  _id: string;
  email: string;
  username: string; // Added from your backend User model
  plan: string; // Added from your backend User model
  trialStart: string | null; // Added from your backend User model
  cycles: number; // Daily pomodoro count
  lastPomodoroDate: string | null; // ISO string date for last cycle update
  tasks: any[]; // Assuming tasks might be part of the user object, or set as empty array
  msg?: string; // Optional message from backend response
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
  incrementUserDailyCycles: () => Promise<void>; // New function to update daily cycles
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Loading state for initial fetch
  const [error, setError] = useState<string | null>(null);

  // Function to fetch user data (used on initial load)
  const fetchUser = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Assuming fetchData returns the User object directly now, matching backend response for /api/auth/me
      const userData = await fetchData<User>("/api/auth/me");
      setUser(userData);
      setIsAuthenticated(true);
    } catch (err: any) {
      if (err instanceof AuthError && err.status === 401) {
        // Expected for unauthenticated users
        // console.log("AuthContext: User is not authenticated (401)."); // Optional: for debugging
      } else {
        console.error("AuthContext: Failed to fetch user:", err);
        setError(err.message || "Failed to fetch user data.");
      }
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Effect to run fetchUser on component mount
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Modified Login function
  const login = useCallback(
    async (emailParam: string, passwordParam: string) => {
      setIsLoading(true);
      setError(null);
      try {
        // postData now returns the User object directly from the backend
        const loggedInUser = await postData<User>("/api/auth/login", {
          email: emailParam,
          password: passwordParam,
        });
        setUser(loggedInUser); // Directly set the user from the response
        setIsAuthenticated(true);
        // Do not call fetchUser() here, as we already have the user data
        setError(null);
      } catch (err: any) {
        console.error("Login error:", err);
        setError(err.message || "Login failed. Please check your credentials.");
        setIsAuthenticated(false);
        setUser(null);
        throw err; // Re-throw the error for the component to handle (e.g., show alert)
      } finally {
        setIsLoading(false);
      }
    },
    [] // No dependencies needed as fetchUser is not called here directly
  );

  // Modified Register function
  const register = useCallback(
    async (
      usernameParam: string,
      emailParam: string,
      passwordParam: string
    ) => {
      // <-- ACCEPT USERNAME PARAM
      setIsLoading(true);
      setError(null);
      try {
        // Pass username to the postData call for registration
        const registeredUser = await postData<User>("/api/auth/register", {
          username: usernameParam, // <-- PASS USERNAME
          email: emailParam,
          password: passwordParam,
        });
        setUser(registeredUser);
        setIsAuthenticated(true);
        setError(null);
      } catch (err: any) {
        console.error("Registration error:", err);
        setError(err.message || "Registration failed.");
        setIsAuthenticated(false);
        setUser(null);
        throw err;
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
      await postData("/api/auth/logout", {});
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    } catch (err: any) {
      console.error("Logout error:", err);
      setError(err.message || "Logout failed.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const incrementUserDailyCycles = useCallback(async () => {
    if (!isAuthenticated || !user?._id) {
      console.warn("Attempted to increment cycles without authenticated user.");
      return;
    }
    setError(null);
    try {
      const updatedUser = await putData<User>(
        "/api/users/cycles/increment",
        {}
      );
      setUser(updatedUser);
    } catch (err: any) {
      console.error("Error incrementing user cycles:", err);
      setError(err.message || "Failed to update daily cycles.");
    }
  }, [isAuthenticated, user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        error,
        login,
        register, // Expose the register function
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
