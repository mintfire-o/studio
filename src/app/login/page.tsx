'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import type { FormData } from '@/types';
import { Palette, KeyRound, Fingerprint, Loader2, Home as HomeIcon, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const { login, isLoading, error: authError } = useAuth();
  const router = useRouter();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const credentials: FormData = { username, password, pin };
    await login(credentials);
    // Navigation is handled by AuthProvider effect
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
            <CardDescription>Sign in to unlock your creative vision.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="e.g., designer"
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
                    placeholder="••••••••"
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
                    type="password" // Use password type to mask PIN
                    placeholder="••••••"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    maxLength={6}
                    pattern="\d{6}"
                    title="PIN must be 6 digits"
                    required
                    className="pl-10 tracking-[0.3em]" // For better PIN appearance
                  />
                </div>
              </div>
              {authError && <p className="text-sm text-destructive text-center">{authError}</p>}
              <Button type="submit" className="w-full text-lg py-3" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Sign In'}
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/">
                  <HomeIcon className="mr-2 h-4 w-4" />
                  Back to Home
                </Link>
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-center text-center text-xs text-muted-foreground space-y-2 pt-6">
            <p>Using mock user IDs for MVP. Try username: designer, password: password123, pin: 123456</p>
            <p>
              Don&apos;t have an account?{' '}
              <Button variant="link" className="p-0 h-auto text-xs" asChild>
                  <Link href="/create-account">
                    <UserPlus className="mr-1 h-3 w-3" /> Create one
                  </Link>
              </Button>
            </p>
          </CardFooter>
        </Card>
      </main>
    </>
  );
}
