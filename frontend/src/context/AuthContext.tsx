import React, { createContext, useState, useContext, useEffect } from 'react';
import authService, { User, RegisterData, LoginData } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthenticating: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    // Check if user is logged in on mount
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (data: LoginData) => {
    try {
      setIsAuthenticating(true);
      const response = await authService.login(data);
      setUser(response.data.user);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      throw new Error(errorMessage);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setIsAuthenticating(true);
      const response = await authService.register(data);
      setUser(response.data.user);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      throw new Error(errorMessage);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    isAuthenticating,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
