
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home as HomeIcon, Image as ImageIcon, History, LogOut, Menu, Settings, User, Home } from 'lucide-react'; 
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/hooks/use-auth';
import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import StylusTextAnimation from '@/components/stylus-text-animation'; 
import { AnimatedBackground } from '@/components/animated-background';


const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: HomeIcon },
  { href: '/dashboard/new-project', label: 'New Project', icon: ImageIcon },
  { href: '/dashboard/history', label: 'History', icon: History },
  { href: '/dashboard/profile', label: 'Profile', icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, isLoading: authLoading } = useAuth();
  const pathname = usePathname();
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);


  if (authLoading) {
    return (
      <div className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-background">
        <StylusTextAnimation />
      </div>
    );
  }

  if (!user) {
    // AuthProvider will redirect, this is an additional safeguard or for when authLoading is false but user is still null.
    return null; 
  }
  
  const NavLinks = () => (
    navItems.map((item) => (
      <Button
        key={item.href}
        asChild
        variant={pathname === item.href ? 'secondary' : 'ghost'}
        className="w-full justify-start text-base"
        onClick={() => setIsSheetOpen(false)} 
      >
        <Link href={item.href}>
          <item.icon className="mr-3 h-5 w-5" />
          {item.label}
        </Link>
      </Button>
    ))
  );

  return (
    <div className="min-h-screen w-full flex flex-col relative">
      <AnimatedBackground />
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 backdrop-blur-md px-4 sm:px-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0 w-72 bg-background/90 backdrop-blur-md">
              <SheetHeader className="border-b">
                <SheetTitle>
                  <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-lg px-4 py-4" onClick={() => setIsSheetOpen(false)}>
                    <Home className="text-primary h-7 w-7" /> 
                    <span>La Interior</span>
                  </Link>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex-grow space-y-2 px-2 py-4">
                <NavLinks />
              </nav>
              <div className="mt-auto p-4 space-y-2 border-t border-border"> 
                <Button variant="ghost" onClick={() => { logout(); setIsSheetOpen(false);}} className="w-full justify-start text-base text-destructive hover:text-destructive hover:bg-destructive/10">
                  <LogOut className="mr-3 h-5 w-5" />
                  Sign Out
                </Button>
              </div>
            </SheetContent>
          </Sheet>
           <Link href="/dashboard" className="hidden md:flex items-center gap-2 font-semibold text-lg">
             <Home className="text-primary h-7 w-7" /> 
             <span>La Interior</span>
           </Link>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
                <span className="sr-only">Open user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-background/90 backdrop-blur-md" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.fullName || user?.username}</p>
                  {user?.email && (
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      
      <div className="flex flex-1 md:grid md:grid-cols-[260px_1fr]">
        <aside className="hidden md:flex h-full max-h-screen flex-col border-r bg-background/80 backdrop-blur-md shadow-inner">
           <nav className="flex-grow space-y-2 px-2 py-4">
            <NavLinks />
          </nav>
        </aside>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-background/70 backdrop-blur-md md:bg-secondary/30 dark:md:bg-muted/10 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
