
'use client';

import type { User, FormData } from '@/types';
import { useRouter, usePathname } from 'next/navigation';
import React, { createContext, useState, useEffect, type ReactNode, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import StylusTextAnimation from '@/components/stylus-text-animation';
// Removed NextResponse and NextRequest as they are for backend API routes

export interface AuthContextType {
  user: User | null;
  login: (credentials: FormData) => Promise<void>;
  logout: () => void;
  isLoading: boolean; // This will now respect the minimum duration
  error: string | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MIN_LOADER_DURATION = 4500; // 4s animation + 0.5s delay

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Controls visual loader
  const [isAuthReady, setIsAuthReady] = useState(false); // True when core auth logic is done
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const loadingStartTimeRef = useRef<number | null>(null);

  // Effect for initial authentication check
  useEffect(() => {
    loadingStartTimeRef.current = Date.now();
    setIsLoading(true); // Show loader immediately
    // isAuthReady remains false until this check completes

    const storedUser = localStorage.getItem('laInteriorUser');
    if (storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (e) {
        localStorage.removeItem('laInteriorUser'); // Clear corrupted data
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setIsAuthReady(true); // Initial auth check finished
  }, []);

  // Effect to manage loader display duration
  useEffect(() => {
    if (isAuthReady) { // This means an auth operation (initial, login, logout) has finished its core logic
      const elapsedTime = Date.now() - (loadingStartTimeRef.current || Date.now());
      const timeRemaining = MIN_LOADER_DURATION - elapsedTime;

      if (timeRemaining > 0) {
        const timer = setTimeout(() => {
          setIsLoading(false); // Hide loader after minimum duration
        }, timeRemaining);
        return () => clearTimeout(timer);
      } else {
        setIsLoading(false); // Hide loader immediately if minimum duration already passed
      }
    }
  }, [isAuthReady]);

  // Effect for handling navigation based on auth state, *after* loader is done
  useEffect(() => {
    if (!isLoading && isAuthReady) { // Only redirect when loader is done AND auth state is settled
      if (!user && pathname !== '/login' && pathname !== '/' && pathname !== '/create-account') {
        router.push('/login');
      } else if (user && (pathname === '/login' || pathname === '/' || pathname === '/create-account')) {
        router.push('/dashboard');
      }
    }
  }, [user, isLoading, isAuthReady, pathname, router]);

  const login = async (credentials: FormData) => {
    loadingStartTimeRef.current = Date.now();
    setIsLoading(true); // Show loader
    setIsAuthReady(false); // Indicate an auth operation is starting
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
        localStorage.setItem('laInteriorUser', JSON.stringify(loggedInUser));
        toast({ title: 'Login Successful', description: `Welcome back, ${loggedInUser.username}!` });
        // Navigation will be handled by the useEffect watching user, isLoading, and isAuthReady
      } else {
        setError(data.message || 'Invalid username, password, or PIN.');
        toast({ title: 'Login Failed', description: data.message || 'Invalid credentials. Please try again.', variant: 'destructive' });
        setUser(null); // Ensure user is null on failed login
      }
    } catch (e) {
      console.error("Login API call error:", e);
      const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred during login.';
      setError(errorMessage);
      toast({ title: 'Login Error', description: errorMessage, variant: 'destructive' });
      setUser(null);
    } finally {
      setIsAuthReady(true); // Mark auth operation as finished
    }
  };

  const logout = () => {
    loadingStartTimeRef.current = Date.now();
    setIsLoading(true); // Show loader
    setIsAuthReady(false); // Indicate an auth operation is starting
    
    setUser(null);
    localStorage.removeItem('laInteriorUser');
    toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
    // Navigation will be handled by the useEffect watching user, isLoading, and isAuthReady
    
    setIsAuthReady(true); // Mark auth operation as finished
  };

  if (isLoading) { // This isLoading now respects the MIN_LOADER_DURATION via the useEffect
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
