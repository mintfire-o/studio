
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

const MIN_LOADER_DURATION = 4500; // Duration of the stylus animation (4s + 0.5s delay)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false); // Tracks if the initial auth check or login/logout process has finished
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const loadingStartTimeRef = useRef<number | null>(null);

  // Effect for initial authentication check from localStorage
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
    setIsAuthReady(true); // Initial auth status determined
  }, []);

  // Effect to manage loading screen duration and hide it
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | undefined;

    if (isAuthReady) {
      const now = Date.now();
      // Ensure loadingStartTimeRef.current has a value, default to now if somehow null
      const startTime = loadingStartTimeRef.current !== null ? loadingStartTimeRef.current : now;
      const elapsedTime = now - startTime;
      const timeToWait = MIN_LOADER_DURATION - elapsedTime;

      if (timeToWait > 0) {
        timeoutId = setTimeout(() => {
          setIsLoading(false);
        }, timeToWait);
      } else {
        // If MIN_LOADER_DURATION already passed, hide loader in the next microtask
        Promise.resolve().then(() => setIsLoading(false));
      }
    } else {
      // If auth is not ready yet (e.g. setIsAuthReady(false) was just called in login/logout)
      // ensure isLoading is true.
      if (!isLoading) {
        setIsLoading(true);
      }
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isAuthReady, isLoading]); // Rerun when isAuthReady or isLoading changes to cover all scenarios

  // Effect for handling navigation based on auth state
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
    setIsAuthReady(false); // Indicate auth process is starting
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
        // Handle non-JSON error responses
        throw new Error(data?.message || `Login failed. Status: ${response.status}. Please check your credentials or server response.`);
      }


      if (response.ok && data?.user) {
        const loggedInUser = data.user as User;
        setUser(loggedInUser);
        localStorage.setItem('laInteriorUser', JSON.stringify(loggedInUser)); 
        toast({ title: 'Login Successful', description: `Welcome back, ${loggedInUser.username}!` });
      } else {
        const errorMessage = data?.message || `Login failed. Please check your credentials.`;
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
      setIsAuthReady(true); // Auth process finished (success or fail)
    }
  };

  const logout = () => {
    setIsLoading(true);
    loadingStartTimeRef.current = Date.now();
    setIsAuthReady(false); // Indicate auth process is starting
    
    setUser(null);
    localStorage.removeItem('laInteriorUser');
    // Note: Toasts might not be visible if immediate navigation occurs.
    // Consider showing toast on the login page after redirect if needed.
    toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
    
    setIsAuthReady(true); // Auth process finished
  };

  // Render loader if isLoading is true, otherwise render children
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
