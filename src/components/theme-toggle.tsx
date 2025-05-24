'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  // This state will hold the *actual* applied theme: 'light' or 'dark'
  const [currentTheme, setCurrentTheme] = React.useState<'light' | 'dark'>('light');

  // Effect to set initial theme and listen for changes
  React.useEffect(() => {
    const applyTheme = (themeToApply: 'light' | 'dark') => {
      document.documentElement.classList.toggle('dark', themeToApply === 'dark');
      setCurrentTheme(themeToApply);
      // Optionally, save user preference to localStorage
      localStorage.setItem('app-theme', themeToApply);
    };
    
    // Check localStorage for saved preference
    const savedTheme = localStorage.getItem('app-theme') as 'light' | 'dark' | null;
    
    if (savedTheme) {
      applyTheme(savedTheme);
    } else {
      // If no saved theme, use system preference
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyTheme(systemPrefersDark ? 'dark' : 'light');
    }

    // Listen to system preference changes IF no user preference is set
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
        const userThemePreference = localStorage.getItem('app-theme');
        if (!userThemePreference) { // Only react if user hasn't made an explicit choice
            applyTheme(e.matches ? 'dark' : 'light');
        }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, []);

  const toggleTheme = () => {
    setCurrentTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
      localStorage.setItem('app-theme', newTheme); // Save user's explicit choice
      return newTheme;
    });
  };

  return (
    <div className="flex items-center gap-2 p-1 border rounded-md bg-card shadow-sm">
      <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label={`Switch to ${currentTheme === 'light' ? 'dark' : 'light'} mode`} className="h-8 w-8">
        {currentTheme === 'light' ? (
          <Sun className="h-[1.2rem] w-[1.2rem]" />
        ) : (
          <Moon className="h-[1.2rem] w-[1.2rem]" />
        )}
        <span className="sr-only">Toggle theme</span>
      </Button>
      <span className="text-sm pr-2 capitalize text-muted-foreground select-none">
        {currentTheme} Mode
      </span>
    </div>
  );
}
