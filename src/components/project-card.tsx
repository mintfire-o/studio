'use client';

import type { Project } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Palette, CalendarDays, Trash2, Edit3 } from 'lucide-react';
import { ColorPaletteDisplay } from './color-swatch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ProjectCardProps {
  project: Project;
  onDelete: (id: string) => void;
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const formattedDate = new Date(project.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  // Preferentially display the AI repainted image if available
  const displayImageUrl = project.aiRepaintedPhotoDataUri || project.roomPhotoUrl;

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-shadow hover:shadow-xl">
      <CardHeader>
        <div className="aspect-video relative w-full rounded-t-lg overflow-hidden mb-2">
          <Image 
            src={displayImageUrl} 
            alt={project.name} 
            layout="fill" 
            objectFit="cover" 
            className="transition-transform duration-300 group-hover:scale-105"
            data-ai-hint={project.aiRepaintedPhotoDataUri ? "repainted room" : "interior room"}
          />
        </div>
        <CardTitle className="text-xl">{project.name}</CardTitle>
        <CardDescription className="flex items-center text-sm">
          <CalendarDays className="mr-2 h-4 w-4" /> Created on {formattedDate}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-3">
        <div className="flex items-center">
          <Palette className="mr-2 h-5 w-5 text-primary" />
          <span className="font-semibold">Colors:</span>
        </div>
        {project.selectedColors && project.selectedColors.length > 0 ? (
            <ColorPaletteDisplay colors={project.selectedColors} />
        ) : project.aiSuggestedPalette?.suggestion && project.aiSuggestedPalette.suggestion.length > 0 ? (
            <ColorPaletteDisplay colors={project.aiSuggestedPalette.suggestion} title="AI Suggested Palette" />
        ) : (
            <p className="text-sm text-muted-foreground">No colors selected or suggested.</p>
        )}
      </CardContent>
      <CardFooter className="grid grid-cols-2 gap-2 border-t pt-4">
        <Button asChild variant="outline">
          <Link href={`/dashboard/new-project?projectId=${project.id}`}> 
            <Edit3 className="mr-2 h-4 w-4" /> View/Edit
          </Link>
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the project "{project.name}".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(project.id)}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}

