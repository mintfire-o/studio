'use client';

import { cn } from '@/lib/utils';
import { Check, Copy } from 'lucide-react';
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface ColorSwatchProps {
  color: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showCopyButton?: boolean;
  label?: string;
  onClick?: () => void;
  isSelected?: boolean;
}

export function ColorSwatch({
  color,
  size = 'md',
  className,
  showCopyButton = false,
  label,
  onClick,
  isSelected = false,
}: ColorSwatchProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent onClick if swatch itself is clickable
    navigator.clipboard.writeText(color);
    setCopied(true);
    toast({ title: 'Copied!', description: `${color} copied to clipboard.` });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'rounded-md shadow-md flex flex-col items-center justify-center group relative transition-all duration-200 ease-in-out',
              sizeClasses[size],
              isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : 'ring-1 ring-border',
              onClick ? 'cursor-pointer hover:scale-105' : '',
              className
            )}
            style={{ backgroundColor: color }}
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
            onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick() } : undefined}
          >
            {showCopyButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopy}
                className="absolute top-1 right-1 p-1 h-6 w-6 bg-background/50 hover:bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={`Copy color ${color}`}
              >
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-foreground/70" />}
              </Button>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{color}{label ? ` - ${label}` : ''}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface ColorPaletteDisplayProps {
  colors: string[];
  onColorSelect?: (color: string) => void;
  selectedColor?: string | null;
  title?: string;
  emptyMessage?: string;
}

export function ColorPaletteDisplay({ colors, onColorSelect, selectedColor, title, emptyMessage = "No colors to display." }: ColorPaletteDisplayProps) {
  if (!colors || colors.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <div className="space-y-2">
      {title && <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>}
      <div className="flex flex-wrap gap-2">
        {colors.map((c, index) => (
          <ColorSwatch
            key={`${c}-${index}`}
            color={c}
            size="md"
            showCopyButton
            onClick={onColorSelect ? () => onColorSelect(c) : undefined}
            isSelected={selectedColor === c}
          />
        ))}
      </div>
    </div>
  );
}

