
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/auth-provider';
import { Toaster } from '@/components/ui/toaster';
import { ProjectProvider } from '@/contexts/project-context';
import Link from 'next/link'; // Added for footer link

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'La Interior - MintFire',
  description: 'AI-Powered Interior Design by MintFire',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap" rel="stylesheet" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function getInitialTheme() {
                  try {
                    const preference = localStorage.getItem('theme-preference');
                    if (preference === 'dark') return 'dark';
                    if (preference === 'light') return 'light';
                    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                      return 'dark';
                    }
                  } catch (e) {
                    // Fallback for environments where localStorage isn't available
                  }
                  return 'light'; // Default to light
                }
                const theme = getInitialTheme();
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}>
        <AuthProvider>
          <ProjectProvider>
            <main className="flex-grow">
              {children}
            </main>
            <Toaster />
            <footer className="w-full py-6 text-center text-sm text-muted-foreground border-t border-border bg-background">
              © {new Date().getFullYear()} La Interior. All rights reserved by MintFire.
              {/* Example of an optional link in footer */}
              {/* <Link href="/privacy-policy" className="ml-2 hover:text-primary">Privacy Policy</Link> */}
            </footer>
          </ProjectProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
