import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import api from "../lib/api";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "member";
  avatar?: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  company: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    data: RegisterData
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  fetchProfile: () => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  canEditTasks: () => boolean;
  canDeleteTasks: () => boolean;
  canCreateTasks: () => boolean;
  canUpdateTaskStatus: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return false;
      }

      const response = await api.get("/auth/profile");

      if (response.data.success && response.data.user) {
        const userData = response.data.user;

        // Only update state if user data has actually changed
        setUser((prevUser) => {
          if (
            !prevUser ||
            JSON.stringify(prevUser) !== JSON.stringify(userData)
          ) {
            // Update stored user data
            localStorage.setItem("user", JSON.stringify(userData));
            return userData;
          }
          return prevUser; // No change, return previous user
        });

        return true;
      }

      return false;
    } catch (error: any) {
      console.error("Profile fetch error:", error);
      // If token is invalid, clear auth data
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      }
      return false;
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem("token");

        if (storedToken) {
          // Validate token by fetching user profile from server
          const isValid = await fetchProfile();
          if (!isValid) {
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            setUser(null);
          }
        } else {
          // No token found, clear any partial auth data
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          setUser(null);
        }
      } catch (error) {
        console.error("Error in AuthProvider initialization:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [fetchProfile]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const login = useCallback(
    async (
      email: string,
      password: string
    ): Promise<{ success: boolean; error?: string }> => {
      setIsLoading(true);
      setError(null); // Clear any previous errors

      try {
        const response = await api.post("/auth/login", { email, password });

        if (response.data.success) {
          const { token, user } = response.data;

          // Store token and user data
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(user));

          // Update auth state
          setUser(user);
          setIsLoading(false);
          return { success: true };
        }
        const errorMsg = response.data.message || "Login failed";
        setError(errorMsg);
        setIsLoading(false);
        return {
          success: false,
          error: errorMsg,
        };
      } catch (error: any) {
        console.error("Login error caught:", error);
        console.error("Error response status:", error.response?.status);
        console.error("Error response data:", error.response?.data);
        console.error("Error code:", error.code);
        console.error("Full error object:", JSON.stringify(error, null, 2));
        setIsLoading(false);

        // Handle different types of errors more explicitly
        if (error.response) {
          // Server responded with an error status
          const status = error.response.status;
          const message = error.response.data?.message;

          let errorMsg: string;
          if (status === 401) {
            errorMsg = message || "Invalid email or password";
          } else if (status >= 500) {
            errorMsg = "Server error. Please try again later.";
          } else if (status === 400) {
            errorMsg = message || "Please check your input and try again.";
          } else {
            errorMsg = message || `Server error (${status}). Please try again.`;
          }

          setError(errorMsg);
          return {
            success: false,
            error: errorMsg,
          };
        } else if (error.request) {
          // Network error - no response received
          const errorMsg =
            "Network error. Please check your connection and try again.";
          setError(errorMsg);
          return {
            success: false,
            error: errorMsg,
          };
        } else {
          // Something else happened
          const errorMsg = "An unexpected error occurred. Please try again.";
          setError(errorMsg);
          return {
            success: false,
            error: errorMsg,
          };
        }
      }
    },
    []
  );

  const register = useCallback(
    async (
      data: RegisterData
    ): Promise<{ success: boolean; error?: string }> => {
      setIsLoading(true);
      setError(null); // Clear any previous errors

      try {
        const response = await api.post("/auth/register", data);

        if (response.data.success) {
          // Don't automatically log in after registration
          // User will need to login manually after successful registration
          setIsLoading(false);
          return { success: true };
        }

        const errorMsg = response.data.message || "Registration failed";
        setError(errorMsg);
        setIsLoading(false);
        return {
          success: false,
          error: errorMsg,
        };
      } catch (error: any) {
        console.error("Registration error:", error);
        const errorMessage =
          error.response?.data?.message || "Network error. Please try again.";
        setError(errorMessage);
        setIsLoading(false);
        return { success: false, error: errorMessage };
      }
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  }, []);

  // Permission functions
  const canEditTasks = useCallback(() => {
    return user?.role === "admin" || user?.role === "manager";
  }, [user?.role]);

  const canDeleteTasks = useCallback(() => {
    return user?.role === "admin" || user?.role === "manager";
  }, [user?.role]);

  const canCreateTasks = useCallback(() => {
    return user?.role === "admin" || user?.role === "manager";
  }, [user?.role]);

  const canUpdateTaskStatus = useCallback(() => {
    // All users (including members) can update task status
    return user !== null;
  }, [user]);

  const contextValue = useMemo(
    () => ({
      user,
      login,
      register,
      logout,
      fetchProfile,
      isLoading,
      error,
      clearError,
      canEditTasks,
      canDeleteTasks,
      canCreateTasks,
      canUpdateTaskStatus,
    }),
    [
      user,
      login,
      register,
      logout,
      fetchProfile,
      isLoading,
      error,
      clearError,
      canEditTasks,
      canDeleteTasks,
      canCreateTasks,
      canUpdateTaskStatus,
    ]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
