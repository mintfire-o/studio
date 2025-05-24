'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Palette, Home, Image as ImageIcon, History, LogOut, Menu, Settings, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import React from 'react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/dashboard/new-project', label: 'New Project', icon: ImageIcon },
  { href: '/dashboard/history', label: 'History', icon: History },
  // { href: '/dashboard/ai-tools', label: 'AI Tools', icon: Bot }, // Could be added later
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
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Palette className="h-12 w-12 animate-pulse text-primary" />
      </div>
    );
  }

  if (!user) {
    // AuthProvider handles redirection, but this is a fallback
    return null; 
  }
  
  const NavContent = () => (
    <>
      <nav className="flex-grow space-y-2 px-2 py-4">
        {navItems.map((item) => (
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
        ))}
      </nav>
      <div className="mt-auto p-4 space-y-2 border-t border-border">
        {/* <Button variant="ghost" className="w-full justify-start text-base">
          <Settings className="mr-3 h-5 w-5" />
          Settings
        </Button> */}
        <Button variant="ghost" onClick={logout} className="w-full justify-start text-base text-destructive hover:text-destructive hover:bg-destructive/10">
          <LogOut className="mr-3 h-5 w-5" />
          Sign Out
        </Button>
      </div>
    </>
  );


  return (
    <div className="min-h-screen w-full flex flex-col bg-secondary/50 dark:bg-card/20">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4 sm:px-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0 w-72">
              <div className="flex h-16 items-center border-b px-4">
                <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-lg" onClick={() => setIsSheetOpen(false)}>
                  <Palette className="h-7 w-7 text-primary" />
                  <span>ColorVisionary</span>
                </Link>
              </div>
              <NavContent />
            </SheetContent>
          </Sheet>
           <Link href="/dashboard" className="hidden md:flex items-center gap-2 font-semibold text-lg">
             <Palette className="h-7 w-7 text-primary" />
             <span>ColorVisionary</span>
           </Link>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground hidden sm:inline">
            Welcome, {user?.username}
          </span>
          <ThemeToggle />
        </div>
      </header>
      
      <div className="flex flex-1 md:grid md:grid-cols-[260px_1fr]">
        <aside className="hidden md:flex h-full max-h-screen flex-col border-r bg-background shadow-inner">
           <NavContent />
        </aside>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-background md:bg-secondary/30 dark:md:bg-muted/10 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
