import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Palette } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-background text-foreground">
      <div className="text-center space-y-8 max-w-md">
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
  );
}
