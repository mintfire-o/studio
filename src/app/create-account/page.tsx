'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { FormData } from '@/types'; // Using FormData for structure, though not sending all fields
import { Palette, KeyRound, Fingerprint, Loader2, UserPlus, LogIn } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';

export default function CreateAccountPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // For potential future validation errors
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    // Basic frontend validation (example)
    if (username.length < 3) {
        setError("Username must be at least 3 characters long.");
        setIsLoading(false);
        return;
    }
    if (password.length < 6) {
        setError("Password must be at least 6 characters long.");
        setIsLoading(false);
        return;
    }
    if (!/^\d{6}$/.test(pin)) {
        setError("PIN must be exactly 6 digits.");
        setIsLoading(false);
        return;
    }

    // Simulate account creation API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    setIsLoading(false);
    toast({
      title: 'Account Created (Mock)',
      description: 'Your account has been successfully created. Please proceed to login.',
    });
    router.push('/login');
  };

  return (
    <>
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-accent/30 p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <Palette size={48} className="text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold">La Interior</CardTitle>
            <CardDescription>Create your account to start designing.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Choose a username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pin">6-Digit PIN</Label>
                <div className="relative">
                   <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="pin"
                    type="password" 
                    placeholder="Set your 6-digit PIN"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    maxLength={6}
                    pattern="\d{6}"
                    title="PIN must be 6 digits"
                    required
                    className="pl-10 tracking-[0.3em]"
                  />
                </div>
              </div>
              {error && <p className="text-sm text-destructive text-center">{error}</p>}
              <Button type="submit" className="w-full text-lg py-3" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Create Account'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="text-center text-sm text-muted-foreground pt-6">
            <p>
              Already have an account?{' '}
              <Button variant="link" className="p-0 h-auto text-sm" asChild>
                <Link href="/login">
                  <LogIn className="mr-1 h-4 w-4" /> Sign In
                </Link>
              </Button>
            </p>
          </CardFooter>
        </Card>
      </main>
    </>
  );
}
