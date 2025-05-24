'use client';

import type { User, FormData } from '@/types';
import { mockLogin } from '@/lib/mock-auth';
import { useRouter, usePathname } from 'next/navigation';
import React, { createContext, useState, useEffect, type ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface AuthContextType {
  user: User | null;
  login: (credentials: FormData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true to check session
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    // Check for persisted session (e.g., from localStorage)
    const storedUser = localStorage.getItem('laInteriorUser');
    if (storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (e) {
        localStorage.removeItem('laInteriorUser');
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading && !user && pathname !== '/login' && pathname !== '/' && pathname !== '/create-account') {
      router.push('/login');
    } else if (!isLoading && user && (pathname === '/login' || pathname === '/' || pathname === '/create-account')) {
      router.push('/dashboard');
    }
  }, [user, isLoading, pathname, router]);

  const login = async (credentials: FormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const loggedInUser = await mockLogin(credentials);
      if (loggedInUser) {
        setUser(loggedInUser);
        localStorage.setItem('laInteriorUser', JSON.stringify(loggedInUser));
        toast({ title: 'Login Successful', description: `Welcome back, ${loggedInUser.username}!` });
        router.push('/dashboard');
      } else {
        setError('Invalid username, password, or PIN.');
        toast({ title: 'Login Failed', description: 'Invalid credentials. Please try again.', variant: 'destructive' });
      }
    } catch (e) {
      setError('An unexpected error occurred during login.');
      toast({ title: 'Login Error', description: 'An unexpected error occurred.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('laInteriorUser');
    toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
}
