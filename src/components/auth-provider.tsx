
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

const MIN_LOADER_DURATION = 4500; 

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
        localStorage.removeItem('laInteriorUser'); 
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setIsAuthReady(true); 
  }, []);

  useEffect(() => {
    if (isAuthReady) { 
      const elapsedTime = Date.now() - (loadingStartTimeRef.current || Date.now());
      const timeRemaining = MIN_LOADER_DURATION - elapsedTime;

      if (timeRemaining > 0) {
        const timer = setTimeout(() => {
          setIsLoading(false); 
        }, timeRemaining);
        return () => clearTimeout(timer);
      } else {
        setIsLoading(false); 
      }
    }
  }, [isAuthReady]);

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
    loadingStartTimeRef.current = Date.now();
    setIsLoading(true); 
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
      }

      if (response.ok && data?.user) {
        const loggedInUser = data.user as User;
        setUser(loggedInUser);
        localStorage.setItem('laInteriorUser', JSON.stringify(loggedInUser)); 
        toast({ title: 'Login Successful', description: `Welcome back, ${loggedInUser.username}!` });
      } else {
        const errorMessage = data?.message || `Login failed. Status: ${response.status}. Please check your credentials.`;
        setError(errorMessage);
        toast({ title: 'Login Failed', description: errorMessage, variant: 'destructive' });
        setUser(null); 
      }
    } catch (e) {
      console.error("Login API call error:", e);
      const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred during login.';
      setError(errorMessage);
      toast({ title: 'Login Error', description: errorMessage, variant: 'destructive' });
      setUser(null);
    } finally {
      setIsAuthReady(true); 
    }
  };

  const logout = () => {
    loadingStartTimeRef.current = Date.now();
    setIsLoading(true); 
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
    <AuthContext.Provider value={{ user, login, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
}
