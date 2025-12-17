'use client';

import React, { createContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { AuthApiClient, User, LoginCredentials, SignupData } from '@/lib/api/auth.api';

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // 🔄 HYDRATION INICIAL
  useEffect(() => {
    const hydrate = async () => {
      try {
        const { user } = await AuthApiClient.me();
        setUser(user);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    hydrate();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    await AuthApiClient.login(credentials);
    const { user } = await AuthApiClient.me();
    console.log('AuthProvider: login user', user);
    setUser(user);
    router.push('/home');
  };

  const logout = async () => {
    try {
      await AuthApiClient.logout();
    } finally {
      setUser(null);
      router.push('/login');
    }
  };

  const signup = async (data: SignupData) => {
    await AuthApiClient.signup(data);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        signup,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
