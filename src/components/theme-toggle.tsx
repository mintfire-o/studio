
'use client';

import { Sun, Moon, Laptop } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect, useCallback } from 'react';

type ThemeMode = 'light' | 'dark' | 'system';

export function ThemeToggle() {
  const [selectedMode, setSelectedMode] = useState<ThemeMode>('system');
  const [triggerIcon, setTriggerIcon] = useState<React.ReactNode>(<Laptop className="h-5 w-5" />);

  const updateEffectiveThemeIcon = useCallback((effectiveMode: 'light' | 'dark') => {
    if (effectiveMode === 'light') {
      setTriggerIcon(<Sun className="h-5 w-5" />);
    } else {
      setTriggerIcon(<Moon className="h-5 w-5" />);
    }
  }, []);

  const applyThemePreference = useCallback((mode: ThemeMode) => {
    localStorage.setItem('theme-preference', mode);
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    let isDarkActive: boolean;

    if (mode === 'system') {
      isDarkActive = mediaQuery.matches;
    } else {
      isDarkActive = mode === 'dark';
    }
    root.classList.toggle('dark', isDarkActive);
    updateEffectiveThemeIcon(isDarkActive ? 'dark' : 'light');
  }, [updateEffectiveThemeIcon]);

  useEffect(() => {
    const storedPreference = localStorage.getItem('theme-preference') as ThemeMode | null;
    const initialMode = storedPreference || 'system';
    setSelectedMode(initialMode);
    // applyThemePreference(initialMode); // Called by selectedMode effect

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const systemThemeChangeListener = () => {
      // If the user has 'system' selected, re-apply based on new system preference
      if (localStorage.getItem('theme-preference') === 'system') {
         applyThemePreference('system');
      }
    };

    mediaQuery.addEventListener('change', systemThemeChangeListener);
    return () => mediaQuery.removeEventListener('change', systemThemeChangeListener);
  }, [applyThemePreference]); // applyThemePreference will be stable due to useCallback

  // This effect applies theme when selectedMode changes (e.g. user clicks an option or on initial load)
  useEffect(() => {
    applyThemePreference(selectedMode);
  }, [selectedMode, applyThemePreference]);


  const handleSetMode = (mode: ThemeMode) => {
    setSelectedMode(mode);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          {triggerIcon}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleSetMode('light')}>
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSetMode('dark')}>
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSetMode('system')}>
          <Laptop className="mr-2 h-4 w-4" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
