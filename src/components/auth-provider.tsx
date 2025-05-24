
'use client';

import type { User, FormData } from '@/types';
import { useRouter, usePathname } from 'next/navigation';
import React, { createContext, useState, useEffect, type ReactNode, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import StylusTextAnimation from '@/components/stylus-text-animation';

export interface AuthContextType {
  user: User | null;
  login: (credentials: FormData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MIN_LOADER_DURATION = 2000; 

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false); 
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const loadingStartTimeRef = useRef<number | null>(null);

  useEffect(() => {
    loadingStartTimeRef.current = Date.now();
    setIsLoading(true);
    
    const storedUser = localStorage.getItem('laInteriorUser');
    if (storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (e) {
        console.error("Error parsing stored user:", e);
        localStorage.removeItem('laInteriorUser'); 
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setIsAuthReady(true); 
  }, []);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | undefined;

    if (isAuthReady) {
      const now = Date.now();
      const startTime = loadingStartTimeRef.current !== null ? loadingStartTimeRef.current : now;
      const elapsedTime = now - startTime;
      const timeToWait = MIN_LOADER_DURATION - elapsedTime;

      if (timeToWait > 0) {
        timeoutId = setTimeout(() => {
          setIsLoading(false);
        }, timeToWait);
      } else {
        Promise.resolve().then(() => setIsLoading(false));
      }
    } else {
      if (!isLoading) {
        setIsLoading(true);
      }
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isAuthReady, isLoading]); 

  useEffect(() => {
    if (!isLoading && isAuthReady) { 
      if (!user && pathname !== '/login' && pathname !== '/' && pathname !== '/create-account') {
        router.push('/login');
      } else if (user && (pathname === '/login' || pathname === '/' || pathname === '/create-account')) {
        router.push('/dashboard');
      }
    }
  }, [user, isLoading, isAuthReady, pathname, router]);

  const login = async (credentials: FormData) => {
    setIsLoading(true); 
    loadingStartTimeRef.current = Date.now();
    setIsAuthReady(false); 
    setError(null);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else if (!response.ok) {
        // Handle non-JSON error responses or unexpected content types
        const text = await response.text();
        const errorMessage = `Login failed. Status: ${response.status}. Server response: ${text || 'No additional error message from server.'}`;
        setError(errorMessage);
        toast({ title: 'Login Failed', description: errorMessage, variant: 'destructive' });
        setUser(null);
        setIsAuthReady(true);
        return;
      }


      if (response.ok && data?.user) {
        const loggedInUser = data.user as User;
        setUser(loggedInUser);
        localStorage.setItem('laInteriorUser', JSON.stringify(loggedInUser)); 
        toast({ title: 'Login Successful', description: `Welcome back, ${loggedInUser.fullName || loggedInUser.username}!` });
      } else {
        const errorMessage = data?.message || `Login failed. Please check your credentials.`;
        setError(errorMessage);
        toast({ title: 'Login Failed', description: errorMessage, variant: 'destructive' });
        setUser(null); 
      }
    } catch (e) {
      console.error("Login API call error:", e);
      let toastTitle = 'Login Error';
      let toastDescription = 'An unexpected error occurred during login.';
      if (e instanceof TypeError && e.message.toLowerCase().includes('failed to fetch')) {
          toastTitle = 'Network Error';
          toastDescription = 'Could not connect to the server. Please check your internet connection and try again.';
      } else if (e instanceof Error) {
          toastDescription = e.message;
      }
      setError(toastDescription);
      toast({ title: toastTitle, description: toastDescription, variant: 'destructive' });
      setUser(null);
    } finally {
      setIsAuthReady(true); 
    }
  };

  const logout = () => {
    setIsLoading(true);
    loadingStartTimeRef.current = Date.now();
    setIsAuthReady(false); 
    
    setUser(null);
    localStorage.removeItem('laInteriorUser');
    toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
    
    setIsAuthReady(true); 
  };

  if (isLoading) { 
    return (
      <div className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-background">
        <StylusTextAnimation />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading: false, error }}>
      {children}
    </AuthContext.Provider>
  );
}
