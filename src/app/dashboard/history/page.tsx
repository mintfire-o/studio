'use client';

import React from 'react';
import { useProjects } from '@/contexts/project-context';
import { ProjectCard } from '@/components/project-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { History as HistoryIcon, PlusCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function HistoryPage() {
  const { projects, deleteProject, isLoading } = useProjects();
  const { toast } = useToast();

  const handleDeleteProject = (id: string) => {
    deleteProject(id);
    toast({
      title: "Project Deleted",
      description: "The project has been successfully deleted.",
    });
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <HistoryIcon className="mr-3 h-8 w-8 text-primary" /> Project History
          </h1>
          <p className="text-muted-foreground mt-1">
            Review and manage your past interior design projects.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/dashboard/new-project">
            <PlusCircle className="mr-2 h-5 w-5" /> Create New Project
          </Link>
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-card">
          <HistoryIcon className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">No Projects Yet</h2>
          <p className="text-muted-foreground mb-6">
            Start a new project to see it appear in your history.
          </p>
          <Button asChild>
            <Link href="/dashboard/new-project">
                <PlusCircle className="mr-2 h-4 w-4" /> Start Your First Project
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {projects.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((project) => (
            <ProjectCard key={project.id} project={project} onDelete={handleDeleteProject} />
          ))}
        </div>
      )}
    </div>
  );
}
