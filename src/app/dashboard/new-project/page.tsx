
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUpload } from '@/components/file-upload';
import { ColorPaletteDisplay, ColorSwatch } from '@/components/color-swatch';
import type { Project, AISuggestion, DetectedWallColor, AIWallColorSuggestion } from '@/types';
import { useProjects } from '@/contexts/project-context';
import { useToast } from '@/hooks/use-toast';
import { generateColorPalette, type GenerateColorPaletteInput, type GenerateColorPaletteOutput } from '@/ai/flows/generate-color-palette';
import { suggestPaintSheen, type SuggestPaintSheenInput, type SuggestPaintSheenOutput } from '@/ai/flows/suggest-paint-sheen';
import { suggestComplementaryColors, type SuggestComplementaryColorsInput, type SuggestComplementaryColorsOutput } from '@/ai/flows/suggest-complementary-colors';
import { repaintWall, type RepaintWallInput, type RepaintWallOutput } from '@/ai/flows/repaint-wall-flow';
import { detectWallColor, type DetectWallColorInput, type DetectWallColorOutput } from '@/ai/flows/detect-wall-color-flow';
import { Loader2, Wand2, Sparkles, Save, Image as ImageIcon, Palette, XCircle, Paintbrush, SearchCode } from 'lucide-react';
import NextImage from 'next/image';


export default function NewProjectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');
  const { addProject, getProjectById, updateProject } = useProjects();
  const { toast } = useToast();

  const [projectName, setProjectName] = useState('');
  const [roomPhoto, setRoomPhoto] = useState<{ name: string; dataUrl: string } | null>(null); // Original uploaded photo
  const [manualColor, setManualColor] = useState<string>('#FFFFFF');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  
  const [aiPalette, setAiPalette] = useState<AISuggestion<string[]>>({ suggestion: [], reasoning: '', isLoading: false, error: null });
  const [aiSheen, setAiSheen] = useState<AISuggestion<string>>({ suggestion: '', reasoning: '', isLoading: false, error: null });
  const [aiComplementary, setAiComplementary] = useState<AISuggestion<string[]>>({ suggestion: [], reasoning: '', isLoading: false, error: null });
  const [aiRepaintedImage, setAiRepaintedImage] = useState<AISuggestion<string | null>>({ suggestion: null, reasoning: '', isLoading: false, error: null });
  const [aiDetectedWallColors, setAiDetectedWallColors] = useState<AIWallColorSuggestion>({ suggestion: [], reasoning: '', isLoading: false, error: null });


  const [activeColorForAiTools, setActiveColorForAiTools] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);


  useEffect(() => {
    if (projectId) {
      const projectToEdit = getProjectById(projectId);
      if (projectToEdit) {
        setIsEditing(true);
        setProjectName(projectToEdit.name);
        setRoomPhoto({ name: 'Uploaded room image', dataUrl: projectToEdit.originalPhotoDataUri });
        setSelectedColors(projectToEdit.selectedColors);
        if (projectToEdit.aiSuggestedPalette) setAiPalette(projectToEdit.aiSuggestedPalette);
        if (projectToEdit.sheenSuggestion) setAiSheen(projectToEdit.sheenSuggestion);
        if (projectToEdit.complementaryColorsSuggestion) setAiComplementary(projectToEdit.complementaryColorsSuggestion);
        if (projectToEdit.aiDetectedWallColors) setAiDetectedWallColors(projectToEdit.aiDetectedWallColors);
        if (projectToEdit.aiRepaintedPhotoDataUri) {
          setAiRepaintedImage({ suggestion: projectToEdit.aiRepaintedPhotoDataUri, reasoning: 'Previously repainted by AI.', isLoading: false, error: null });
        }
        // Set first selected color as active, or first from AI palette if no manual ones.
        if (projectToEdit.selectedColors.length > 0) {
            setActiveColorForAiTools(projectToEdit.selectedColors[0]);
        } else if (projectToEdit.aiSuggestedPalette?.suggestion && projectToEdit.aiSuggestedPalette.suggestion.length > 0) {
            setActiveColorForAiTools(projectToEdit.aiSuggestedPalette.suggestion[0]);
        }
      } else {
        toast({ title: "Error", description: "Project not found.", variant: "destructive" });
        router.push('/dashboard/history');
      }
    }
  }, [projectId, getProjectById, toast, router]);


  const handleFileUpload = (fileData: { name: string; dataUrl: string }) => {
    if(fileData.dataUrl) {
      setRoomPhoto(fileData);
      // Reset AI suggestions if new image is uploaded, unless editing
      if (!isEditing) {
        setAiPalette({ suggestion: [], reasoning: '', isLoading: false, error: null });
        setAiSheen({ suggestion: '', reasoning: '', isLoading: false, error: null });
        setAiComplementary({ suggestion: [], reasoning: '', isLoading: false, error: null });
        setAiRepaintedImage({ suggestion: null, reasoning: '', isLoading: false, error: null });
        setAiDetectedWallColors({ suggestion: [], reasoning: '', isLoading: false, error: null });
        setSelectedColors([]);
        setActiveColorForAiTools(null);
      }
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
      toast({ title: 'AI Palette Generated!', description: 'Review the suggested colors.' });
    } catch (error) {
      console.error('Error generating palette:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate palette.';
      setAiPalette({ suggestion: [], reasoning: '', isLoading: false, error: errorMessage });
      toast({ title: 'AI Error', description: errorMessage, variant: 'destructive' });
    }
  };

  const callDetectWallColor = async () => {
    if (!roomPhoto?.dataUrl) {
      toast({ title: 'Error', description: 'Please upload a room photo first.', variant: 'destructive' });
      return;
    }
    setAiDetectedWallColors(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const input: DetectWallColorInput = { photoDataUri: roomPhoto.dataUrl };
      const result = await detectWallColor(input);
      setAiDetectedWallColors({ suggestion: result.wallColors, reasoning: result.reasoning, isLoading: false, error: null });
      toast({ title: 'AI Wall Colors Detected!', description: 'Review the detected wall colors.' });
    } catch (error) {
      console.error('Error detecting wall colors:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to detect wall colors.';
      setAiDetectedWallColors({ suggestion: [], reasoning: '', isLoading: false, error: errorMessage });
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

  const callAiRepaintWall = async () => {
    if (!roomPhoto?.dataUrl || !activeColorForAiTools) {
      toast({ title: 'Error', description: 'Please upload a room photo and select an active color first.', variant: 'destructive' });
      return;
    }
    setAiRepaintedImage(prev => ({ ...prev, isLoading: true, error: null, suggestion: null }));
    try {
      const input: RepaintWallInput = { originalPhotoDataUri: roomPhoto.dataUrl, selectedColorHex: activeColorForAiTools };
      const result = await repaintWall(input);
      setAiRepaintedImage({ suggestion: result.repaintedImageDataUri, reasoning: 'AI repainted image based on your selection.', isLoading: false, error: null });
      toast({ title: 'AI Wall Repaint Successful!', description: 'The preview has been updated with the AI-generated image.' });
    } catch (error) {
      console.error('Error repainting wall with AI:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to repaint wall with AI.';
      setAiRepaintedImage({ suggestion: null, reasoning: '', isLoading: false, error: errorMessage });
      toast({ title: 'AI Repaint Error', description: errorMessage, variant: 'destructive' });
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

    const projectData: Project = {
      id: isEditing && projectId ? projectId : Date.now().toString(),
      name: projectName,
      // roomPhotoUrl will be the one to display: repainted if available, else original
      roomPhotoUrl: aiRepaintedImage.suggestion || roomPhoto.dataUrl, 
      originalPhotoDataUri: roomPhoto.dataUrl,
      aiRepaintedPhotoDataUri: aiRepaintedImage.suggestion || null,
      selectedColors,
      aiSuggestedPalette: aiPalette.suggestion && aiPalette.suggestion.length > 0 ? aiPalette : null,
      sheenSuggestion: aiSheen.suggestion ? aiSheen : null,
      complementaryColorsSuggestion: aiComplementary.suggestion && aiComplementary.suggestion.length > 0 ? aiComplementary : null,
      aiDetectedWallColors: aiDetectedWallColors.suggestion && aiDetectedWallColors.suggestion.length > 0 ? aiDetectedWallColors : null,
      createdAt: isEditing && projectId ? getProjectById(projectId)!.createdAt : new Date().toISOString(),
    };

    if (isEditing) {
        updateProject(projectData);
        toast({ title: 'Project Updated!', description: `"${projectName}" has been successfully updated.` });
    } else {
        addProject(projectData);
        toast({ title: 'Project Saved!', description: `"${projectName}" has been added to your history.` });
    }
    router.push('/dashboard/history');
  };
  
  const AiToolButton = ({ onClick, isLoading, icon: Icon, label, disabled }: {onClick: () => void, isLoading: boolean, icon: React.ElementType, label: string, disabled?: boolean}) => (
    <Button onClick={onClick} disabled={isLoading || disabled} className="w-full">
      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Icon className="mr-2 h-4 w-4" />}
      {label}
    </Button>
  );

  const currentPreviewImage = aiRepaintedImage.suggestion || roomPhoto?.dataUrl;

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <ImageIcon className="h-6 w-6 text-primary" /> 
            {isEditing ? 'Edit Project' : 'Create New Project'}
          </CardTitle>
          <CardDescription>
            {isEditing ? 'Update the details of your project.' : 'Upload an image of your room and start designing.'}
          </CardDescription>
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
              <div className="space-y-2">
                <AiToolButton 
                    onClick={callDetectWallColor} 
                    isLoading={aiDetectedWallColors.isLoading} 
                    icon={SearchCode} 
                    label="AI Detect Wall Color(s)" 
                />
                {aiDetectedWallColors.error && <p className="text-sm text-destructive">{aiDetectedWallColors.error}</p>}
                {aiDetectedWallColors.suggestion && aiDetectedWallColors.suggestion.length > 0 && (
                    <div>
                        <h4 className="text-sm font-medium text-muted-foreground mt-2">AI Detected Wall Colors (Click to select):</h4>
                        <div className="flex flex-wrap gap-2">
                        {aiDetectedWallColors.suggestion.map((detected, index) => (
                            <ColorSwatch 
                                key={`${detected.hex}-${index}`} 
                                color={detected.hex}
                                label={detected.name}
                                onClick={() => handleColorSelectFromPalette(detected.hex)}
                                isSelected={activeColorForAiTools === detected.hex}
                                showCopyButton
                            />
                        ))}
                        </div>
                        {aiDetectedWallColors.reasoning && <p className="text-xs text-muted-foreground mt-1">{aiDetectedWallColors.reasoning}</p>}
                    </div>
                )}
              </div>

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
            <CardContent className="space-y-4">
              <AiToolButton 
                onClick={callAiRepaintWall}
                isLoading={aiRepaintedImage.isLoading}
                icon={Paintbrush}
                label="AI Repaint Wall with Active Color"
                disabled={!activeColorForAiTools || !roomPhoto?.dataUrl}
              />
              {aiRepaintedImage.error && <p className="text-sm text-destructive">{aiRepaintedImage.error}</p>}
               {aiRepaintedImage.isLoading && (
                <div className="flex items-center justify-center text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>AI is repainting the image... (this may take a moment)</span>
                </div>
              )}


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
      
      {currentPreviewImage && (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl">Project Preview</CardTitle>
                <CardDescription>
                    {aiRepaintedImage.suggestion 
                        ? "AI-generated visualization of your room with the selected color. Further edits can be made by selecting a new color and running AI Repaint again." 
                        : "This is a conceptual preview. Use AI Repaint tool to visualize colors on walls. The active color tint helps visualize if AI repaint is not used."
                    }
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="aspect-video relative w-full max-w-xl mx-auto rounded-lg overflow-hidden border shadow-lg bg-muted/20">
                    <NextImage src={currentPreviewImage} alt={projectName || "Room Preview"} layout="fill" objectFit="contain" />
                    {/* Apply tint only if it's the original image and no AI repaint is loading or successful */}
                    {activeColorForAiTools && !aiRepaintedImage.suggestion && !aiRepaintedImage.isLoading && (
                        <div
                            style={{ backgroundColor: activeColorForAiTools }}
                            className="absolute inset-0 mix-blend-color pointer-events-none"
                        />
                    )}
                     {aiRepaintedImage.isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                            <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        </div>
                    )}
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
                         {activeColorForAiTools && !aiRepaintedImage.suggestion && (
                            <p className="text-sm mt-2">
                                Preview tinted with: <ColorSwatch color={activeColorForAiTools} size="sm" className="inline-block align-middle" /> <span style={{color: activeColorForAiTools, fontWeight: 'bold'}}>{activeColorForAiTools}</span>
                            </p>
                        )}
                         {aiRepaintedImage.suggestion && activeColorForAiTools && (
                             <p className="text-sm mt-2">
                                AI Repainted with: <ColorSwatch color={activeColorForAiTools} size="sm" className="inline-block align-middle" /> <span style={{color: activeColorForAiTools, fontWeight: 'bold'}}>{activeColorForAiTools}</span>
                            </p>
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
            {isEditing ? 'Update Project' : 'Save Project'}
          </Button>
        </div>
      )}
    </div>
  );
}

