'use client';

import { Sun, Moon, Laptop } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

type ThemeMode = 'light' | 'dark' | 'system';

export function ThemeToggle() {
  const [selectedMode, setSelectedMode] = useState<ThemeMode>('system');

  const applyThemePreference = useCallback((mode: ThemeMode) => {
    localStorage.setItem('theme-preference', mode);
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    if (mode === 'system') {
      const systemTheme = mediaQuery.matches ? 'dark' : 'light';
      root.classList.toggle('dark', systemTheme === 'dark');
    } else {
      root.classList.toggle('dark', mode === 'dark');
    }
  }, []);

  useEffect(() => {
    const storedPreference = localStorage.getItem('theme-preference') as ThemeMode | null;
    const initialMode = storedPreference || 'system';
    setSelectedMode(initialMode);
    // Apply theme after initial state is set, handled by the selectedMode effect if needed or directly
    // Forcing an apply here to ensure correctness on load before selectedMode effect might run
    applyThemePreference(initialMode);


    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      // Only update if current preference is 'system'
      if (localStorage.getItem('theme-preference') === 'system') {
        applyThemePreference('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [applyThemePreference]); // Removed selectedMode from deps to avoid loop, initial call is enough

  // This effect ensures theme is reapplied if selectedMode changes programmatically or from initial load
  useEffect(() => {
    applyThemePreference(selectedMode);
  }, [selectedMode, applyThemePreference]);


  const handleSetMode = (mode: ThemeMode) => {
    setSelectedMode(mode);
    // applyThemePreference is called by the useEffect watching selectedMode
  };

  return (
    <div className="flex items-center gap-1 p-0.5 border rounded-md bg-background shadow-sm">
      <Button
        variant={selectedMode === 'light' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => handleSetMode('light')}
        aria-pressed={selectedMode === 'light'}
        className="h-8 px-2 flex-1 justify-center sm:flex-none sm:justify-start"
      >
        <Sun className="h-4 w-4 sm:mr-1" />
        <span className="hidden sm:inline">Light</span>
      </Button>
      <Button
        variant={selectedMode === 'dark' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => handleSetMode('dark')}
        aria-pressed={selectedMode === 'dark'}
        className="h-8 px-2 flex-1 justify-center sm:flex-none sm:justify-start"
      >
        <Moon className="h-4 w-4 sm:mr-1" />
        <span className="hidden sm:inline">Dark</span>
      </Button>
      <Button
        variant={selectedMode === 'system' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => handleSetMode('system')}
        aria-pressed={selectedMode === 'system'}
        className="h-8 px-2 flex-1 justify-center sm:flex-none sm:justify-start"
      >
        <Laptop className="h-4 w-4 sm:mr-1" />
        <span className="hidden sm:inline">System</span>
      </Button>
    </div>
  );
}
