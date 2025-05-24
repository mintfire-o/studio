
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
  // selectedMode is the user's *preference* (light, dark, system)
  const [selectedMode, setSelectedMode] = useState<ThemeMode>('system');
  // triggerIcon reflects the *effective* theme (sun, moon, or laptop for system if not yet resolved)
  const [triggerIcon, setTriggerIcon] = useState<React.ReactNode>(<Laptop className="h-5 w-5" />);

  // Function to update the visual icon based on the effective theme
  const updateIconBasedOnEffectiveTheme = useCallback(() => {
    const isCurrentlyDark = document.documentElement.classList.contains('dark');
    const currentPreference = localStorage.getItem('theme-preference') as ThemeMode | null || 'system';

    if (currentPreference === 'system') {
        setTriggerIcon(<Laptop className="h-5 w-5" />);
    } else if (isCurrentlyDark) {
      setTriggerIcon(<Moon className="h-5 w-5" />);
    } else {
      setTriggerIcon(<Sun className="h-5 w-5" />);
    }
  }, []);

  // Effect 1: Initialize selectedMode from localStorage and set up system theme listener
  useEffect(() => {
    const storedPreference = localStorage.getItem('theme-preference') as ThemeMode | null;
    const initialUserPreference = storedPreference || 'system';
    setSelectedMode(initialUserPreference); // This triggers Effect 2

    // Listener for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (localStorage.getItem('theme-preference') === 'system') {
        if (e.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        updateIconBasedOnEffectiveTheme(); // Update icon when system theme changes and preference is 'system'
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    // Initial icon update after ensuring selectedMode is set
    // This will be more accurate after Effect 2 has run for the initial selectedMode
    // updateIconBasedOnEffectiveTheme(); 

    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, [updateIconBasedOnEffectiveTheme]);


  // Effect 2: Apply theme when user's *preference* (selectedMode) changes, or on initial load via setSelectedMode.
  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // Always store the current preference
    localStorage.setItem('theme-preference', selectedMode);

    if (selectedMode === 'light') {
      root.classList.remove('dark');
    } else if (selectedMode === 'dark') {
      root.classList.add('dark');
    } else { // selectedMode === 'system'
      // For system, rely on the media query for the actual class.
      // The inline script handles initial state. The listener (in Effect 1) handles changes.
      if (mediaQuery.matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
    // After class is set by preference, update the icon
    updateIconBasedOnEffectiveTheme();
  }, [selectedMode, updateIconBasedOnEffectiveTheme]);


  const handleSetMode = (mode: ThemeMode) => {
    setSelectedMode(mode); // This will trigger Effect 2
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
