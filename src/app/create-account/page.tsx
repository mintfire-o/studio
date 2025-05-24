
'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { FormData } from '@/types';
import { Palette, KeyRound, Fingerprint, Loader2, User, Mail, Phone, LogIn, AtSign } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { AnimatedBackground } from '@/components/animated-background';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Mock list of taken usernames for demonstration
const MOCK_TAKEN_USERNAMES = ['admin', 'root', 'superuser', 'testuser'];

export default function CreateAccountPage() {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+91'); // Default to India
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const isValidEmail = (email: string) => {
    // Gmail-only validation
    return /^[^\s@]+@gmail\.com$/.test(email);
  };

  const isValidPhoneNumber = (phone: string) => {
    // Basic phone validation (e.g., 10 digits for many regions)
    return /^\d{10}$/.test(phone);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    if (fullName.length < 3) {
      setError("Full Name must be at least 3 characters long.");
      setIsLoading(false);
      return;
    }
    if (username.length < 3) {
      setError("Username must be at least 3 characters long.");
      setIsLoading(false);
      return;
    }
    if (MOCK_TAKEN_USERNAMES.includes(username.toLowerCase())) {
      setError(`Username "${username}" is already taken. Please choose another.`);
      setIsLoading(false);
      return;
    }
    if (!isValidEmail(email)) {
      setError("Please enter a valid @gmail.com email address.");
      setIsLoading(false);
      return;
    }
    if (!isValidPhoneNumber(phoneNumber)) {
      setError("Phone Number must be 10 digits (excluding country code).");
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

    // Simulate API call / database save
    await new Promise(resolve => setTimeout(resolve, 1000));

    const completePhoneNumber = `${countryCode}${phoneNumber}`;

    // Mock data collected:
    const accountData: Partial<FormData> = {
      fullName,
      username,
      email,
      phoneNumber: completePhoneNumber,
      password, // In a real app, password would be hashed
      pin,      // In a real app, PIN would be handled securely
    };
    console.log('Mock Account Data to be saved:', accountData);

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
      <main className="relative flex items-center justify-center min-h-screen p-4 overflow-hidden">
        <AnimatedBackground />
        <Card className="w-full max-w-md shadow-2xl z-10 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-[0_0_35px_5px_hsl(var(--primary)/0.2)] bg-card/80 backdrop-blur-sm dark:bg-card/70">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <Palette size={48} className="text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold">La Interior</CardTitle>
            <CardDescription>Create your account to start designing.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="fullName">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="pl-10 hover:border-primary/50 focus:border-primary transition-colors duration-300"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Choose a unique username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="pl-10 hover:border-primary/50 focus:border-primary transition-colors duration-300"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="email">Email (Gmail only)</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 hover:border-primary/50 focus:border-primary transition-colors duration-300"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <div className="flex gap-2">
                  <Select value={countryCode} onValueChange={setCountryCode}>
                    <SelectTrigger className="w-[80px] hover:border-primary/50 focus:border-primary transition-colors duration-300">
                      <SelectValue placeholder="Code" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="+91">+91 (IN)</SelectItem>
                      <SelectItem value="+1">+1 (US)</SelectItem>
                      <SelectItem value="+44">+44 (UK)</SelectItem>
                      <SelectItem value="+61">+61 (AU)</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="relative flex-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="phoneNumber"
                      type="tel"
                      placeholder="10-digit phone number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))} // Allow only digits
                      maxLength={10}
                      pattern="\d{10}"
                      title="Phone number must be 10 digits"
                      required
                      className="pl-10 hover:border-primary/50 focus:border-primary transition-colors duration-300"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Actual geo-location for prefix is not implemented in this mock.</p>
              </div>

              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a strong password (min. 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 hover:border-primary/50 focus:border-primary transition-colors duration-300"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="pin">6-Digit PIN</Label>
                <div className="relative">
                   <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="pin"
                    type="password" // Mask PIN input
                    placeholder="Set your 6-digit PIN"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} // Allow only digits
                    maxLength={6}
                    pattern="\d{6}"
                    title="PIN must be 6 digits"
                    required
                    className="pl-10 tracking-[0.3em] hover:border-primary/50 focus:border-primary transition-colors duration-300"
                  />
                </div>
              </div>
              {error && <p className="text-sm text-destructive text-center pt-2">{error}</p>}
              <Button type="submit" className="w-full text-lg py-3 mt-6 transition-all duration-300 ease-in-out hover:shadow-lg transform hover:scale-[1.02]" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Create Account'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="text-center text-sm text-muted-foreground pt-4">
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
