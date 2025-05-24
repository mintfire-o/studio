'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUpload } from '@/components/file-upload';
import { ColorPaletteDisplay, ColorSwatch } from '@/components/color-swatch';
import type { Project, AISuggestion } from '@/types';
import { useProjects } from '@/contexts/project-context';
import { useToast } from '@/hooks/use-toast';
import { generateColorPalette, type GenerateColorPaletteInput, type GenerateColorPaletteOutput } from '@/ai/flows/generate-color-palette';
import { suggestPaintSheen, type SuggestPaintSheenInput, type SuggestPaintSheenOutput } from '@/ai/flows/suggest-paint-sheen';
import { suggestComplementaryColors, type SuggestComplementaryColorsInput, type SuggestComplementaryColorsOutput } from '@/ai/flows/suggest-complementary-colors';
import { Loader2, Wand2, Sparkles, Save, Image as ImageIcon, Palette } from 'lucide-react';
import NextImage from 'next/image';

const initialAiSuggestionState = { suggestion: null, reasoning: '', isLoading: false, error: null };

export default function NewProjectPage() {
  const [projectName, setProjectName] = useState('');
  const [roomPhoto, setRoomPhoto] = useState<{ name: string; dataUrl: string } | null>(null);
  const [manualColor, setManualColor] = useState<string>('#FFFFFF');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  
  const [aiPalette, setAiPalette] = useState<AISuggestion<string[]>>({ suggestion: [], reasoning: '', isLoading: false, error: null });
  const [aiSheen, setAiSheen] = useState<AISuggestion<string>>({ suggestion: '', reasoning: '', isLoading: false, error: null });
  const [aiComplementary, setAiComplementary] = useState<AISuggestion<string[]>>({ suggestion: [], reasoning: '', isLoading: false, error: null });

  const [activeColorForAiTools, setActiveColorForAiTools] = useState<string | null>(null);

  const { addProject } = useProjects();
  const router = useRouter();
  const { toast } = useToast();

  const handleFileUpload = (fileData: { name: string; dataUrl: string }) => {
    if(fileData.dataUrl) {
      setRoomPhoto(fileData);
      // Reset AI suggestions if new image is uploaded
      setAiPalette({ suggestion: [], reasoning: '', isLoading: false, error: null });
      setAiSheen({ suggestion: '', reasoning: '', isLoading: false, error: null });
      setAiComplementary({ suggestion: [], reasoning: '', isLoading: false, error: null });
      setSelectedColors([]);
      setActiveColorForAiTools(null);
    } else {
      setRoomPhoto(null);
    }
  };

  const handleAddManualColor = () => {
    if (manualColor && !selectedColors.includes(manualColor)) {
      const newSelectedColors = [...selectedColors, manualColor];
      setSelectedColors(newSelectedColors);
      if (!activeColorForAiTools) setActiveColorForAiTools(manualColor);
    }
  };

  const handleColorSelectFromPalette = (color: string) => {
    setActiveColorForAiTools(color);
    if (!selectedColors.includes(color)) {
        setSelectedColors(prev => [...prev, color]);
    }
  };
  
  const handleRemoveSelectedColor = (colorToRemove: string) => {
    setSelectedColors(prev => prev.filter(c => c !== colorToRemove));
    if (activeColorForAiTools === colorToRemove) {
        setActiveColorForAiTools(selectedColors.length > 1 ? selectedColors.filter(c => c !== colorToRemove)[0] : null);
    }
  };


  const callGeneratePalette = async () => {
    if (!roomPhoto?.dataUrl) {
      toast({ title: 'Error', description: 'Please upload a room photo first.', variant: 'destructive' });
      return;
    }
    setAiPalette(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const input: GenerateColorPaletteInput = { photoDataUri: roomPhoto.dataUrl };
      const result = await generateColorPalette(input);
      setAiPalette({ suggestion: result.palette, reasoning: 'AI generated palette based on your image.', isLoading: false, error: null });
      // Optionally auto-select the first color or add palette to selectedColors
      // setSelectedColors(result.palette);
      // if (result.palette.length > 0) setActiveColorForAiTools(result.palette[0]);
      toast({ title: 'AI Palette Generated!', description: 'Review the suggested colors.' });
    } catch (error) {
      console.error('Error generating palette:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate palette.';
      setAiPalette({ suggestion: [], reasoning: '', isLoading: false, error: errorMessage });
      toast({ title: 'AI Error', description: errorMessage, variant: 'destructive' });
    }
  };

  const callSuggestSheen = async () => {
    if (!roomPhoto?.dataUrl || !activeColorForAiTools) {
      toast({ title: 'Error', description: 'Please upload a photo and select a color first.', variant: 'destructive' });
      return;
    }
    setAiSheen(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const input: SuggestPaintSheenInput = { photoDataUri: roomPhoto.dataUrl, selectedColor: activeColorForAiTools };
      const result = await suggestPaintSheen(input);
      setAiSheen({ suggestion: result.suggestedSheen, reasoning: result.reasoning, isLoading: false, error: null });
      toast({ title: 'AI Sheen Suggested!', description: `Suggested sheen: ${result.suggestedSheen}` });
    } catch (error) {
      console.error('Error suggesting sheen:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to suggest sheen.';
      setAiSheen({ suggestion: '', reasoning: '', isLoading: false, error: errorMessage });
      toast({ title: 'AI Error', description: errorMessage, variant: 'destructive' });
    }
  };

  const callSuggestComplementaryColors = async () => {
    if (!roomPhoto?.dataUrl || !activeColorForAiTools) {
      toast({ title: 'Error', description: 'Please upload a photo and select a color first.', variant: 'destructive' });
      return;
    }
    setAiComplementary(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const input: SuggestComplementaryColorsInput = { photoDataUri: roomPhoto.dataUrl, selectedColor: activeColorForAiTools };
      const result = await suggestComplementaryColors(input);
      setAiComplementary({ suggestion: result.complementaryColors, reasoning: result.reasoning, isLoading: false, error: null });
      toast({ title: 'AI Complementary Colors Suggested!', description: 'Check out the complementary color ideas.' });
    } catch (error) {
      console.error('Error suggesting complementary colors:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to suggest complementary colors.';
      setAiComplementary({ suggestion: [], reasoning: '', isLoading: false, error: errorMessage });
      toast({ title: 'AI Error', description: errorMessage, variant: 'destructive' });
    }
  };


  const handleSaveProject = () => {
    if (!projectName) {
      toast({ title: 'Error', description: 'Please enter a project name.', variant: 'destructive' });
      return;
    }
    if (!roomPhoto) {
      toast({ title: 'Error', description: 'Please upload a room photo.', variant: 'destructive' });
      return;
    }

    const newProject: Project = {
      id: Date.now().toString(), // Simple ID generation
      name: projectName,
      roomPhotoUrl: roomPhoto.dataUrl, // For display, might be a remote URL in a real app
      originalPhotoDataUri: roomPhoto.dataUrl, // For AI processing
      selectedColors,
      aiSuggestedPalette: aiPalette.suggestion && aiPalette.suggestion.length > 0 ? aiPalette : null,
      sheenSuggestion: aiSheen.suggestion ? aiSheen : null,
      complementaryColorsSuggestion: aiComplementary.suggestion && aiComplementary.suggestion.length > 0 ? aiComplementary : null,
      createdAt: new Date().toISOString(),
    };
    addProject(newProject);
    toast({ title: 'Project Saved!', description: `"${projectName}" has been added to your history.` });
    router.push('/dashboard/history');
  };
  
  const AiToolButton = ({ onClick, isLoading, icon: Icon, label, disabled }: {onClick: () => void, isLoading: boolean, icon: React.ElementType, label: string, disabled?: boolean}) => (
    <Button onClick={onClick} disabled={isLoading || disabled} className="w-full">
      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Icon className="mr-2 h-4 w-4" />}
      {label}
    </Button>
  );

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2"><ImageIcon className="h-6 w-6 text-primary" /> Create New Project</CardTitle>
          <CardDescription>Upload an image of your room and start designing.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="project-name">Project Name</Label>
            <Input
              id="project-name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g., Living Room Makeover"
            />
          </div>
          <FileUpload onFileUpload={handleFileUpload} />
        </CardContent>
      </Card>

      {roomPhoto?.dataUrl && (
        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2"><Palette className="h-5 w-5 text-primary" />Color Selection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="manual-color">Choose Your Own Color</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    id="manual-color"
                    type="color"
                    value={manualColor}
                    onChange={(e) => setManualColor(e.target.value)}
                    className="p-1 h-10 w-16"
                  />
                  <Input
                    type="text"
                    value={manualColor}
                    onChange={(e) => setManualColor(e.target.value)}
                    placeholder="#RRGGBB"
                    className="max-w-[120px]"
                  />
                  <Button onClick={handleAddManualColor} variant="outline">Add Color</Button>
                </div>
              </div>
              
              {selectedColors.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2 text-muted-foreground">Your Selected Colors (Click to use with AI tools or remove):</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedColors.map(color => (
                      <div key={color} className="relative group">
                        <ColorSwatch 
                            color={color} 
                            isSelected={color === activeColorForAiTools} 
                            onClick={() => handleColorSelectFromPalette(color)}
                        />
                        <Button 
                            variant="destructive" 
                            size="icon" 
                            className="absolute -top-2 -right-2 h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                            onClick={(e) => { e.stopPropagation(); handleRemoveSelectedColor(color);}}
                        >
                            <XCircle className="h-4 w-4"/>
                        </Button>
                       </div>
                    ))}
                  </div>
                  {activeColorForAiTools && <p className="text-xs mt-1 text-primary">Active for AI tools: <span style={{color: activeColorForAiTools, fontWeight: 'bold'}}>{activeColorForAiTools}</span></p>}
                </div>
              )}

              <AiToolButton 
                onClick={callGeneratePalette} 
                isLoading={aiPalette.isLoading} 
                icon={Sparkles} 
                label="Use AI Palette Suggestion" 
              />
              {aiPalette.error && <p className="text-sm text-destructive">{aiPalette.error}</p>}
              {aiPalette.suggestion && aiPalette.suggestion.length > 0 && (
                 <ColorPaletteDisplay 
                    colors={aiPalette.suggestion} 
                    onColorSelect={handleColorSelectFromPalette}
                    selectedColor={activeColorForAiTools}
                    title="AI Suggested Palette (Click to select):"
                 />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2"><Wand2 className="h-5 w-5 text-primary" />AI Assistant Tools</CardTitle>
              {!activeColorForAiTools && <CardDescription>Select a color from your palette to activate these tools.</CardDescription>}
            </CardHeader>
            <CardContent className="space-y-6">
              <AiToolButton 
                onClick={callSuggestSheen} 
                isLoading={aiSheen.isLoading} 
                icon={Wand2} 
                label="Suggest Paint Sheen"
                disabled={!activeColorForAiTools}
              />
              {aiSheen.error && <p className="text-sm text-destructive">{aiSheen.error}</p>}
              {aiSheen.suggestion && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">AI Sheen Suggestion:</h4>
                  <p className="font-semibold">{aiSheen.suggestion}</p>
                  <p className="text-xs text-muted-foreground">{aiSheen.reasoning}</p>
                </div>
              )}

              <AiToolButton 
                onClick={callSuggestComplementaryColors} 
                isLoading={aiComplementary.isLoading} 
                icon={Wand2} 
                label="Suggest Complementary Colors"
                disabled={!activeColorForAiTools} 
              />
              {aiComplementary.error && <p className="text-sm text-destructive">{aiComplementary.error}</p>}
              {aiComplementary.suggestion && aiComplementary.suggestion.length > 0 && (
                 <>
                    <ColorPaletteDisplay 
                        colors={aiComplementary.suggestion}
                        onColorSelect={handleColorSelectFromPalette}
                        selectedColor={activeColorForAiTools}
                        title="AI Complementary Colors:"
                    />
                    <p className="text-xs text-muted-foreground">{aiComplementary.reasoning}</p>
                 </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
      
      {roomPhoto?.dataUrl && (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl">Project Preview</CardTitle>
                <CardDescription>This is a conceptual preview. Actual color replacement on image is an advanced feature.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="aspect-video relative w-full max-w-xl mx-auto rounded-lg overflow-hidden border shadow-lg">
                    <NextImage src={roomPhoto.dataUrl} alt={projectName || "Room Preview"} layout="fill" objectFit="contain" />
                </div>
                {(selectedColors.length > 0 || (aiPalette.suggestion && aiPalette.suggestion.length > 0)) && (
                    <div>
                        <h4 className="text-lg font-semibold mb-2">Color Palette Overview:</h4>
                        {selectedColors.length > 0 && (
                            <ColorPaletteDisplay colors={selectedColors} title="Your Chosen Colors:" />
                        )}
                        {aiPalette.suggestion && aiPalette.suggestion.length > 0 && !selectedColors.some(c => aiPalette.suggestion!.includes(c)) && (
                            <ColorPaletteDisplay colors={aiPalette.suggestion} title="AI Suggested Palette:" />
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
      )}


      {roomPhoto?.dataUrl && projectName && (
        <div className="mt-8 flex justify-end">
          <Button size="lg" onClick={handleSaveProject} className="text-lg">
            <Save className="mr-2 h-5 w-5" />
            Save Project
          </Button>
        </div>
      )}
    </div>
  );
}

// Helper component to display loading/error for AI suggestions - not used currently, integrated into main component
// const AISuggestionDisplay = <T,>({ suggestion, renderSuggestion, title }: { suggestion: AISuggestion<T>, renderSuggestion: (data: T) => ReactNode, title: string }) => {
//   if (suggestion.isLoading) return <div className="flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading {title}...</div>;
//   if (suggestion.error) return <p className="text-sm text-destructive">Error loading {title}: {suggestion.error}</p>;
//   if (!suggestion.suggestion || (Array.isArray(suggestion.suggestion) && suggestion.suggestion.length === 0)) return null;

//   return (
//     <div>
//       <h4 className="text-sm font-medium text-muted-foreground">{title}:</h4>
//       {renderSuggestion(suggestion.suggestion)}
//       {suggestion.reasoning && <p className="text-xs text-muted-foreground mt-1">{suggestion.reasoning}</p>}
//     </div>
//   );
// };
