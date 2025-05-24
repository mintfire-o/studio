// src/components/animated-background.tsx
'use client';

export function AnimatedBackground() {
  return (
    <div
      className="absolute inset-0 -z-10 animate-waving-glitter bg-300%"
      style={{
        backgroundImage: `linear-gradient(135deg, 
          hsl(var(--background)) 0%, 
          hsl(var(--primary) / 0.5) 15%, 
          hsl(var(--accent) / 0.7) 30%, 
          hsl(var(--muted)) 45%,
          hsl(var(--foreground) / 0.4) 55%, 
          hsl(var(--accent) / 0.7) 70%, 
          hsl(var(--primary) / 0.5) 85%, 
          hsl(var(--background)) 100%
        )`,
      }}
      aria-hidden="true"
    />
  );
}
