import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { useMutation, UseMutationResult, useQueryClient } from "@tanstack/react-query";
import { LoginCredentials, LoginResponse } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: any | null;
  advisor: any | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<LoginResponse, Error, LoginCredentials>;
  logoutMutation: UseMutationResult<void, Error, void>;
};

export const AuthContext = createContext<AuthContextType | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Store both the user data and advisor data
  const [user, setUser] = useState<any>(null);
  const [advisor, setAdvisor] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Function to refresh the token
  const refreshToken = async () => {
    try {
      const storedData = localStorage.getItem('authData');
      if (!storedData) {
        throw new Error("No refresh token available");
      }
      
      const parsedData = JSON.parse(storedData);
      if (!parsedData.refresh_token) {
        throw new Error("No refresh token found in stored data");
      }
      
      const res = await fetch("https://backend.myadvisor.sg/refresh", {
        method: "POST",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refresh_token: parsedData.refresh_token
        })
      });

      if (!res.ok) {
        throw new Error("Failed to refresh token");
      }

      const newTokenData = await res.json();
      // Update stored auth data with new tokens
      localStorage.setItem('authData', JSON.stringify({
        ...parsedData,
        access_token: newTokenData.access_token,
        refresh_token: newTokenData.refresh_token
      }));
      
      return newTokenData;
    } catch (error) {
      console.error("Token refresh failed:", error);
      throw error;
    }
  };

  useEffect(() => {
    // Get authentication data from storage
    const storedData = localStorage.getItem('authData');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setUser(parsedData.user);
        setAdvisor(parsedData.advisor);

        // Try to refresh the token when the app loads
        refreshToken().catch(() => {
          // If refresh fails, clear the stored data
          localStorage.removeItem('authData');
          setUser(null);
          setAdvisor(null);
        });
      } catch (err) {
        console.error("Failed to parse stored auth data", err);
        localStorage.removeItem('authData');
      }
    }
    setIsLoading(false);
  }, []);

  const loginMutation = useMutation<LoginResponse, Error, LoginCredentials>({
    mutationFn: async (credentials: LoginCredentials) => {
      try {
        // Direct API call to backend
        const res = await fetch("https://backend.myadvisor.sg/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(credentials),
          // Include credentials to handle cookies if the API uses them
          credentials: 'include'
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.detail || errorData.message || "Login failed");
        }

        return await res.json() as LoginResponse;
      } catch (error: any) {
        console.error("Login error:", error);
        throw error;
      }
    },
    onSuccess: (data: LoginResponse, variables: LoginCredentials) => {
      // Store advisor info from response
      const authData = {
        user: variables,  // Store email for reference
        advisor: data.advisor
      };

      localStorage.setItem('authData', JSON.stringify(authData));
      setUser(variables);
      setAdvisor(data.advisor);

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['questions'] });

      toast({
        title: "Login successful",
        description: data.message || `Welcome back, ${data.advisor.name || 'Advisor'}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    },
  });

  const getAuthToken = () => {
    const storedData = localStorage.getItem('authData');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        return parsedData.access_token;
      } catch (error) {
        console.error("Error parsing auth data:", error);
        return null;
      }
    }
    return null;
  };

  const logoutMutation = useMutation<void, Error, void>({
    mutationFn: async () => {
      try {
        const token = getAuthToken();

        if (!token) {
          // If no token is found, just clear local state without API call
          return;
        }

        const res = await fetch("https://backend.myadvisor.sg/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });

        if (!res.ok) {
          throw new Error("Logout failed");
        }
      } catch (error) {
        console.error("Logout error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      // Clear stored data
      localStorage.removeItem('authData');
      setUser(null);
      setAdvisor(null);

      // Invalidate queries
      queryClient.invalidateQueries();

      toast({
        title: "Logged out successfully"
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user,
        advisor,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}