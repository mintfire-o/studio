import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Palette } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export default function HomePage() {
  return (
    <>
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <main className="relative flex flex-col items-center justify-center min-h-screen p-8 text-foreground overflow-hidden">
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
        ></div>
        <div className="text-center space-y-8 max-w-md z-10"> {/* Ensure content is above background */}
          <div className="flex flex-col items-center space-y-4">
            <Palette size={64} className="text-primary" />
            <h1 className="text-5xl font-bold tracking-tight">
              La Interior
            </h1>
            <p className="text-2xl text-muted-foreground">
              by <span className="font-semibold text-primary">MintFire</span>
            </p>
          </div>
          
          <p className="text-lg">
            Transform your space with the power of AI. Visualize paint colors in your room, get expert suggestions, and bring your vision to life.
          </p>

          <Button asChild size="lg" className="w-full sm:w-auto text-lg py-6 px-10 shadow-lg hover:shadow-xl transition-shadow">
            <Link href="/login">Sign In to Get Started</Link>
          </Button>
          
          <p className="text-sm text-muted-foreground pt-4">
            Experience the future of interior design.
          </p>
        </div>
      </main>
    </>
  );
}
