
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { ImageIcon, History, Palette, Bot, Loader2, AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { generateInspirationImage } from '@/ai/flows/generate-inspiration-image-flow';

interface InspirationImage {
  id: string;
  src: string;
  alt: string;
  hint: string;
  prompt: string;
  isLoading: boolean;
  error?: string | null;
}

const initialPrompts = [
  { id: 'living-room', prompt: "A bright and airy Scandinavian style living room with light wood furniture, large windows, and pastel accents", alt: "Scandinavian Living Room", hint: "living room scandinavian" },
  { id: 'bedroom', prompt: "A cozy bohemian bedroom with macrame wall hangings, layered textiles, and many indoor plants", alt: "Bohemian Bedroom", hint: "bedroom bohemian" },
  { id: 'kitchen', prompt: "A sleek, modern minimalist kitchen with dark cabinets, marble countertops, and gold fixtures", alt: "Modern Minimalist Kitchen", hint: "kitchen modern" }
];

const FALLBACK_IMAGE_SRC = "https://placehold.co/600x400.png";

export default function DashboardPage() {
  const { user } = useAuth();
  const [galleryImages, setGalleryImages] = useState<InspirationImage[]>(
    initialPrompts.map(p => ({ ...p, src: '', isLoading: true, error: null }))
  );

  useEffect(() => {
    const fetchImages = async () => {
      for (const promptItem of initialPrompts) {
        try {
          const result = await generateInspirationImage({ prompt: promptItem.prompt });
          setGalleryImages(prev =>
            prev.map(img =>
              img.id === promptItem.id
                ? { ...img, src: result.imageDataUri, isLoading: false, error: null }
                : img
            )
          );
        } catch (err) {
          console.error(`Failed to generate image for prompt "${promptItem.prompt}":`, err);
          const errorMessage = err instanceof Error ? err.message : "Failed to load image";
          setGalleryImages(prev =>
            prev.map(img =>
              img.id === promptItem.id
                ? { ...img, src: FALLBACK_IMAGE_SRC, isLoading: false, error: errorMessage }
                : img
            )
          );
        }
      }
    };

    fetchImages();
  }, []);

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
            <CardDescription>Get inspired by these beautiful AI-generated room transformations.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {galleryImages.map((img) => (
                    <div key={img.id} className="rounded-lg overflow-hidden shadow-md aspect-video relative group bg-muted/50">
                        {img.isLoading ? (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                            <Loader2 className="h-12 w-12 animate-spin text-primary" />
                            <p className="mt-2 text-sm">Generating...</p>
                          </div>
                        ) : img.error ? (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-destructive p-4 text-center">
                            <AlertTriangle className="h-10 w-10 mb-2" />
                            <p className="text-sm font-semibold">Image Error</p>
                            <p className="text-xs">{img.error.length > 100 ? img.error.substring(0,100) + '...' : img.error }</p>
                            <Image 
                                src={FALLBACK_IMAGE_SRC} 
                                alt={img.alt + " (Fallback)"}
                                width={600} 
                                height={400} 
                                className="object-cover w-full h-full opacity-20"
                                data-ai-hint={img.hint}
                            />
                          </div>
                        ) : (
                          <>
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
                          </>
                        )}
                    </div>
                ))}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
