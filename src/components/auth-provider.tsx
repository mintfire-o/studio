
'use client';

import type { User, FormData } from '@/types';
import { useRouter, usePathname } from 'next/navigation';
import React, { createContext, useState, useEffect, type ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import StylusTextAnimation from '@/components/stylus-text-animation'; 
import { NextResponse, type NextRequest } from 'next/server';


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
  const [isLoading, setIsLoading] = useState(true); 
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
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
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok) {
        const loggedInUser = data.user as User;
        setUser(loggedInUser);
        localStorage.setItem('laInteriorUser', JSON.stringify(loggedInUser)); // Store user session
        toast({ title: 'Login Successful', description: `Welcome back, ${loggedInUser.username}!` });
        router.push('/dashboard');
      } else {
        setError(data.message || 'Invalid username, password, or PIN.');
        toast({ title: 'Login Failed', description: data.message || 'Invalid credentials. Please try again.', variant: 'destructive' });
      }
    } catch (e) {
      console.error("Login API call error:", e);
      setError('An unexpected error occurred during login.');
      toast({ title: 'Login Error', description: 'An unexpected error occurred.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setIsLoading(true); // Show loader during logout process
    setUser(null);
    localStorage.removeItem('laInteriorUser');
    toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
    // Simulate a slight delay for the loader to be visible if needed
    setTimeout(() => {
        router.push('/login');
        setIsLoading(false);
    }, 300); 
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-background">
        <StylusTextAnimation />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
}
