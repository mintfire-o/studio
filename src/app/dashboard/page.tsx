
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { ImageIcon, History, Palette, Bot } from 'lucide-react';
import Image from 'next/image';

const staticDashboardGalleryImages = [
  { id: 'scandinavian-living-room', src: "https://drive.google.com/uc?export=view&id=1Mm9tZmk9BKn7wi9Jw2Ai_-A7q60lHUA1", alt: "Scandinavian Living Room", hint: "living room scandinavian" },
  { id: 'bohemian-bedroom', src: "https://drive.google.com/uc?export=view&id=18iRNYBIDP26v3VV9qb3836w0M1971cpn", alt: "Bohemian Bedroom", hint: "bedroom bohemian" },
  { id: 'modern-minimalist-kitchen', src: "https://drive.google.com/uc?export=view&id=1vmL4CuSwb6lAeYxI5vGFffmY7EcMkiza", alt: "Modern Minimalist Kitchen", hint: "kitchen modern" }
];


export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <div className="bg-card p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          Welcome to La Interior, {user?.fullName || user?.username}!
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Ready to transform your space? Let's get started.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <ImageIcon className="h-10 w-10 text-accent mb-3" />
            <CardTitle className="text-2xl">Start a New Project</CardTitle>
            <CardDescription>
              Upload a photo of your room and let our AI help you visualize new colors or choose your own.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full text-lg py-3">
              <Link href="/dashboard/new-project">Create Project</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <History className="h-10 w-10 text-accent mb-3" />
            <CardTitle className="text-2xl">View Project History</CardTitle>
            <CardDescription>
              Access your saved projects, review color choices, and revisit AI suggestions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full text-lg py-3">
              <Link href="/dashboard/history">My History</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-xl transition-shadow duration-300 md:col-span-2 lg:col-span-1">
          <CardHeader>
            <Bot className="h-10 w-10 text-accent mb-3" />
            <CardTitle className="text-2xl">AI Design Assistant</CardTitle>
            <CardDescription>
              Leverage AI for color palettes, sheen advice, and complementary color matching. Integrated into your project workflow.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <p className="text-sm text-muted-foreground">Our AI tools are available when you create or edit a project.</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8 overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
            <CardTitle className="text-2xl">Inspiration Gallery</CardTitle>
            <CardDescription>Get inspired by these beautiful room transformations.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {staticDashboardGalleryImages.map((img) => (
                    <div key={img.id} className="rounded-lg overflow-hidden shadow-md aspect-video relative group bg-muted/50">
                        <Image 
                            src={img.src} 
                            alt={img.alt} 
                            width={600} 
                            height={400} 
                            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                            data-ai-hint={img.hint}
                        />
                         <div className="absolute inset-0 bg-black/30 flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <p className="text-white font-semibold">{img.alt}</p>
                        </div>
                    </div>
                ))}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
