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
      const res = await fetch("https://backend.myadvisor.sg/refresh", {
        method: "POST",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!res.ok) {
        throw new Error("Failed to refresh token");
      }
      
      return await res.json();
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

  const logoutMutation = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch("https://backend.myadvisor.sg/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: 'include'
        });
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.detail || errorData.message || "Logout failed");
        }
      } catch (error) {
        console.error("Logout error:", error);
        // Even if the API call fails, we'll still remove the auth data from localStorage
        // as a fallback to ensure users can log out
      }
    },
    onSuccess: () => {
      // Clear auth data from local storage
      localStorage.removeItem('authData');
      setUser(null);
      setAdvisor(null);
      
      // Clear any cached data
      queryClient.clear();
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
      
      // Still clear local data on error for better UX
      localStorage.removeItem('authData');
      setUser(null);
      setAdvisor(null);
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