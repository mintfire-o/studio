
'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface PasswordStrengthIndicatorProps {
  password?: string;
}

const calculateStrength = (password: string): number => {
  let score = 0;
  if (!password) return 0;

  // Award points for length
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;

  // Award points for character types
  if (/[a-z]/.test(password)) score++; // Lowercase
  if (/[A-Z]/.test(password)) score++; // Uppercase
  if (/[0-9]/.test(password)) score++; // Numbers
  if (/[^A-Za-z0-9]/.test(password)) score++; // Symbols

  // Normalize score to 0-4 range
  if (score > 4) score = 4; // Cap at 4 for 4 segments (+1 for initial state = 5 levels total)
  if (password.length < 6 && score > 1) score = 1; // Penalize short passwords
  if (password.length === 0) score = 0;


  // Map score to 0-4 levels for 4 segments
  if (score <= 1 && password.length > 0) return 1; // Very weak (length might be >0 but score low)
  if (score === 2) return 2; // Weak
  if (score === 3) return 3; // Medium
  if (score >= 4) return 4; // Strong

  return 0; // Default if no password or very short
};

export function PasswordStrengthIndicator({ password = '' }: PasswordStrengthIndicatorProps) {
  const strength = calculateStrength(password);

  const strengthLevels = [
    { level: 0, color: 'bg-muted', label: 'Too short' }, // Base for no/short password
    { level: 1, color: 'bg-red-500', label: 'Weak' },
    { level: 2, color: 'bg-orange-400', label: 'Medium' },
    { level: 3, color: 'bg-yellow-400', label: 'Good' }, // Changed from 'Medium'
    { level: 4, color: 'bg-green-500', label: 'Strong' },
  ];

  return (
    <div className="mt-2">
      <div className="flex h-2 rounded-full overflow-hidden">
        {strengthLevels.slice(1).map((lvl, index) => ( // Slice to skip 'Too short' for bar segments
          <div
            key={lvl.level}
            className={cn(
              'flex-1 transition-colors duration-300 ease-in-out',
              index < strength ? lvl.color : 'bg-muted' // color filled segments
            )}
            title={strengthLevels[strength]?.label} // Show current overall strength label
          />
        ))}
      </div>
      {password.length > 0 && (
         <p className={cn(
            "text-xs mt-1",
            strength === 1 && "text-red-500",
            strength === 2 && "text-orange-400",
            strength === 3 && "text-yellow-500", // slightly darker yellow for better contrast
            strength === 4 && "text-green-500",
            strength === 0 && "text-muted-foreground"
          )}>
            Strength: {strengthLevels[strength]?.label || 'Very Weak'}
        </p>
      )}
    </div>
  );
}
