
'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
import { generateColorPalette, type GenerateColorPaletteInput } from '@/ai/flows/generate-color-palette';
import { suggestPaintSheen, type SuggestPaintSheenInput } from '@/ai/flows/suggest-paint-sheen';
import { suggestComplementaryColors, type SuggestComplementaryColorsInput } from '@/ai/flows/suggest-complementary-colors';
import { repaintWall, type RepaintWallInput } from '@/ai/flows/repaint-wall-flow';
import { detectWallColor, type DetectWallColorInput } from '@/ai/flows/detect-wall-color-flow';
import { Loader2, Wand2, Sparkles, Save, Image as ImageIcon, Palette, XCircle, Paintbrush, Info } from 'lucide-react';
import NextImage from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function NewProjectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');
  const { addProject, getProjectById, updateProject } = useProjects();
  const { toast } = useToast();

  const [projectName, setProjectName] = useState('');
  const [roomPhoto, setRoomPhoto] = useState<{ name: string; dataUrl: string } | null>(null);
  const [manualColor, setManualColor] = useState<string>('#FFFFFF');
  const [userSelectedColors, setUserSelectedColors] = useState<string[]>([]); // Colors user explicitly picks or adds

  const [aiDetectedWallColors, setAiDetectedWallColors] = useState<AIWallColorSuggestion>({ suggestion: [], reasoning: '', isLoading: false, error: null });
  const [aiSuggestedPalette, setAiSuggestedPalette] = useState<AISuggestion<string[]>>({ suggestion: [], reasoning: '', isLoading: false, error: null });
  const [aiRepaintedImage, setAiRepaintedImage] = useState<AISuggestion<string | null>>({ suggestion: null, reasoning: '', isLoading: false, error: null });
  
  const [activeColorForWall, setActiveColorForWall] = useState<string | null>(null); // Drives the AI repaint
  const [activeTab, setActiveTab] = useState<'aiSuggestion' | 'chooseOwn'>('aiSuggestion');

  const [aiSheen, setAiSheen] = useState<AISuggestion<string>>({ suggestion: '', reasoning: '', isLoading: false, error: null });
  const [aiComplementary, setAiComplementary] = useState<AISuggestion<string[]>>({ suggestion: [], reasoning: '', isLoading: false, error: null });
  
  const [isEditing, setIsEditing] = useState(false);
  const [isInitialLoadForEditComplete, setIsInitialLoadForEditComplete] = useState(false);

  // Debounce function
  const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    return (...args: Parameters<F>): Promise<ReturnType<F>> =>
      new Promise(resolve => {
        if (timeout) {
          clearTimeout(timeout);
        }
        timeout = setTimeout(() => resolve(func(...args)), waitFor);
      });
  };

  const callAiRepaintWall = useCallback(async () => {
    if (!roomPhoto?.dataUrl || !activeColorForWall) {
      // toast({ title: 'Error', description: 'Please upload a room photo and select an active color first.', variant: 'destructive' });
      return;
    }
    setAiRepaintedImage(prev => ({ ...prev, isLoading: true, error: null, suggestion: prev.suggestion })); // Keep previous suggestion while loading new
    try {
      const input: RepaintWallInput = { originalPhotoDataUri: roomPhoto.dataUrl, selectedColorHex: activeColorForWall };
      const result = await repaintWall(input);
      setAiRepaintedImage({ suggestion: result.repaintedImageDataUri, reasoning: `AI repainted with ${activeColorForWall}.`, isLoading: false, error: null });
      toast({ title: 'AI Wall Repaint Successful!', description: 'The preview has been updated.' });
    } catch (error) {
      console.error('Error repainting wall with AI:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to repaint wall with AI.';
      setAiRepaintedImage({ suggestion: roomPhoto.dataUrl, reasoning: '', isLoading: false, error: errorMessage }); // Revert to original on error
      toast({ title: 'AI Repaint Error', description: errorMessage, variant: 'destructive' });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomPhoto?.dataUrl, activeColorForWall, toast]); // Don't include aiRepaintedImage here

  const debouncedRepaint = useCallback(debounce(callAiRepaintWall, 1000), [callAiRepaintWall]);

  useEffect(() => {
    if (activeColorForWall && roomPhoto?.dataUrl && isInitialLoadForEditComplete) {
      if (!aiRepaintedImage.isLoading) { // Only trigger if not already loading
         debouncedRepaint();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeColorForWall, isInitialLoadForEditComplete]); // roomPhoto?.dataUrl is implicitly handled by callAiRepaintWall guard


  const callDetectWallColor = useCallback(async (photoDataUri: string) => {
    setAiDetectedWallColors(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const input: DetectWallColorInput = { photoDataUri };
      const result = await detectWallColor(input);
      setAiDetectedWallColors({ suggestion: result.wallColors, reasoning: result.reasoning, isLoading: false, error: null });
      if (result.wallColors.length > 0) {
        // setActiveColorForWall(result.wallColors[0].hex); // Optionally auto-select first detected
      }
      // After detecting, if AI tab is active, fetch palette
      if (activeTab === 'aiSuggestion') {
        callGeneratePalette(photoDataUri);
      }
    } catch (error) {
      console.error('Error detecting wall colors:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to detect wall colors.';
      setAiDetectedWallColors({ suggestion: [], reasoning: '', isLoading: false, error: errorMessage });
      toast({ title: 'AI Error', description: errorMessage, variant: 'destructive' });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, toast]); // Removed callGeneratePalette from deps to avoid loop with activeTab

  const callGeneratePalette = useCallback(async (photoDataUri: string) => {
    if (!photoDataUri) return;
    setAiSuggestedPalette(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const input: GenerateColorPaletteInput = { photoDataUri };
      const result = await generateColorPalette(input);
      setAiSuggestedPalette({ suggestion: result.palette, reasoning: 'AI generated palette based on your image.', isLoading: false, error: null });
    } catch (error) {
      console.error('Error generating palette:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate palette.';
      setAiSuggestedPalette({ suggestion: [], reasoning: '', isLoading: false, error: errorMessage });
      toast({ title: 'AI Error', description: errorMessage, variant: 'destructive' });
    }
  }, [toast]);
  

  useEffect(() => {
    if (projectId) {
      const projectToEdit = getProjectById(projectId);
      if (projectToEdit) {
        setIsEditing(true);
        setProjectName(projectToEdit.name);
        setRoomPhoto({ name: 'Uploaded room image', dataUrl: projectToEdit.originalPhotoDataUri });
        setUserSelectedColors(projectToEdit.selectedColors);
        
        if (projectToEdit.aiSuggestedPalette) setAiSuggestedPalette(projectToEdit.aiSuggestedPalette);
        if (projectToEdit.sheenSuggestion) setAiSheen(projectToEdit.sheenSuggestion);
        if (projectToEdit.complementaryColorsSuggestion) setAiComplementary(projectToEdit.complementaryColorsSuggestion);
        if (projectToEdit.aiDetectedWallColors) setAiDetectedWallColors(projectToEdit.aiDetectedWallColors);
        
        if (projectToEdit.aiRepaintedPhotoDataUri) {
          setAiRepaintedImage({ suggestion: projectToEdit.aiRepaintedPhotoDataUri, reasoning: 'Previously repainted by AI.', isLoading: false, error: null });
        } else {
          setAiRepaintedImage({ suggestion: projectToEdit.originalPhotoDataUri, reasoning: '', isLoading: false, error: null });
        }

        const lastActiveColor = projectToEdit.selectedColors.find(c => projectToEdit.aiRepaintedPhotoDataUri?.includes(c)) || projectToEdit.selectedColors[0] || projectToEdit.aiSuggestedPalette?.suggestion?.[0];
        if(lastActiveColor) setActiveColorForWall(lastActiveColor);

        // Trigger initial detection and palette if editing an older project without these
        if (!projectToEdit.aiDetectedWallColors && projectToEdit.originalPhotoDataUri) {
            callDetectWallColor(projectToEdit.originalPhotoDataUri);
        } else if (!projectToEdit.aiSuggestedPalette && activeTab === 'aiSuggestion' && projectToEdit.originalPhotoDataUri) {
            callGeneratePalette(projectToEdit.originalPhotoDataUri);
        }
        setIsInitialLoadForEditComplete(true);
      } else {
        toast({ title: "Error", description: "Project not found.", variant: "destructive" });
        router.push('/dashboard/history');
      }
    } else {
        setIsInitialLoadForEditComplete(true); // New project, so initial load is "complete"
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, getProjectById, toast, router]); // activeTab, callDetectWallColor, callGeneratePalette removed from deps


  const handleFileUpload = (fileData: { name: string; dataUrl: string }) => {
    if (fileData.dataUrl) {
      setRoomPhoto(fileData);
      // Reset states for new image
      setUserSelectedColors([]);
      setActiveColorForWall(null);
      setAiRepaintedImage({ suggestion: fileData.dataUrl, reasoning: '', isLoading: false, error: null }); // Show original initially
      setAiSuggestedPalette({ suggestion: [], reasoning: '', isLoading: false, error: null }); // Clear palette
      setAiDetectedWallColors({ suggestion: [], reasoning: '', isLoading: false, error: null }); // Clear detection
      
      // Trigger automatic detection for the new image
      callDetectWallColor(fileData.dataUrl);
    } else {
      setRoomPhoto(null);
      setAiRepaintedImage({ suggestion: null, reasoning: '', isLoading: false, error: null });
    }
  };

  const handleColorSelection = (color: string) => {
    setActiveColorForWall(color);
    if (!userSelectedColors.includes(color)) {
      setUserSelectedColors(prev => [...prev, color]);
    }
  };
  
  const handleAddManualColor = () => {
    if (manualColor && !userSelectedColors.includes(manualColor)) {
      const newSelectedColors = [...userSelectedColors, manualColor];
      setUserSelectedColors(newSelectedColors);
      handleColorSelection(manualColor); // Make it active and trigger repaint
    }
  };

  const handleRemoveSelectedColor = (colorToRemove: string) => {
    setUserSelectedColors(prev => prev.filter(c => c !== colorToRemove));
    if (activeColorForWall === colorToRemove) {
      const nextActive = userSelectedColors.length > 1 ? userSelectedColors.filter(c => c !== colorToRemove)[0] : null;
      setActiveColorForWall(nextActive);
      // Repaint will trigger via useEffect if nextActive is not null
    }
  };

  const callSuggestSheen = async () => {
    if (!roomPhoto?.dataUrl || !activeColorForWall) {
      toast({ title: 'Error', description: 'Please ensure an image is uploaded and a wall color is active.', variant: 'destructive' });
      return;
    }
    setAiSheen(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const input: SuggestPaintSheenInput = { photoDataUri: roomPhoto.dataUrl, selectedColor: activeColorForWall };
      const result = await suggestPaintSheen(input);
      setAiSheen({ suggestion: result.suggestedSheen, reasoning: result.reasoning, isLoading: false, error: null });
      toast({ title: 'AI Sheen Suggested!', description: `Suggested sheen: ${result.suggestedSheen}` });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to suggest sheen.';
      setAiSheen({ suggestion: '', reasoning: '', isLoading: false, error: errorMessage });
      toast({ title: 'AI Error', description: errorMessage, variant: 'destructive' });
    }
  };

  const callSuggestComplementaryColors = async () => {
     if (!roomPhoto?.dataUrl || !activeColorForWall) {
      toast({ title: 'Error', description: 'Please ensure an image is uploaded and a wall color is active.', variant: 'destructive' });
      return;
    }
    setAiComplementary(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const input: SuggestComplementaryColorsInput = { photoDataUri: roomPhoto.dataUrl, selectedColor: activeColorForWall };
      const result = await suggestComplementaryColors(input);
      setAiComplementary({ suggestion: result.complementaryColors, reasoning: result.reasoning, isLoading: false, error: null });
      toast({ title: 'AI Complementary Colors Suggested!' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to suggest complementary colors.';
      setAiComplementary({ suggestion: [], reasoning: '', isLoading: false, error: errorMessage });
      toast({ title: 'AI Error', description: errorMessage, variant: 'destructive' });
    }
  };

  const handleSaveProject = () => {
    if (!projectName) {
      toast({ title: 'Error', description: 'Project name is required.', variant: 'destructive' });
      return;
    }
    if (!roomPhoto?.dataUrl) {
      toast({ title: 'Error', description: 'Room photo is required.', variant: 'destructive' });
      return;
    }

    const projectData: Project = {
      id: isEditing && projectId ? projectId : Date.now().toString(),
      name: projectName,
      roomPhotoUrl: aiRepaintedImage.suggestion || roomPhoto.dataUrl, 
      originalPhotoDataUri: roomPhoto.dataUrl,
      aiRepaintedPhotoDataUri: (aiRepaintedImage.suggestion && aiRepaintedImage.suggestion !== roomPhoto.dataUrl) ? aiRepaintedImage.suggestion : null,
      selectedColors: userSelectedColors,
      aiSuggestedPalette: aiSuggestedPalette.suggestion.length > 0 ? aiSuggestedPalette : null,
      sheenSuggestion: aiSheen.suggestion ? aiSheen : null,
      complementaryColorsSuggestion: aiComplementary.suggestion.length > 0 ? aiComplementary : null,
      aiDetectedWallColors: aiDetectedWallColors.suggestion.length > 0 ? aiDetectedWallColors : null,
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

  const currentDisplayImage = aiRepaintedImage.suggestion || roomPhoto?.dataUrl;

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <ImageIcon className="h-6 w-6 text-primary" /> 
            {isEditing ? 'Edit Project' : 'Create New Project'}
          </CardTitle>
          <CardDescription>
            {isEditing ? 'Update project details or upload a new image to start over.' : 'Upload your room image to begin.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="project-name">Project Name</Label>
            <Input id="project-name" value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="e.g., Living Room Makeover" />
          </div>
          <FileUpload onFileUpload={handleFileUpload} />
        </CardContent>
      </Card>

      {roomPhoto?.dataUrl && (
        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Left Column: Preview */}
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="text-xl">Main Color Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="aspect-video relative w-full mx-auto rounded-lg overflow-hidden border shadow-lg bg-muted/20">
                {currentDisplayImage ? (
                  <NextImage src={currentDisplayImage} alt={projectName || "Room Preview"} layout="fill" objectFit="contain" />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">Upload an image to see a preview.</div>
                )}
                {aiRepaintedImage.isLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-background p-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <span className="mt-2 font-semibold text-center">AI is repainting... this may take a moment.</span>
                  </div>
                )}
                {aiRepaintedImage.error && !aiRepaintedImage.isLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-destructive/90 p-4 text-center">
                    <XCircle className="h-10 w-10 text-destructive-foreground mb-2" />
                    <p className="text-destructive-foreground font-bold text-lg">AI Repaint Failed</p>
                    <p className="text-xs text-destructive-foreground/90 max-w-md overflow-y-auto max-h-20">{aiRepaintedImage.error}</p>
                  </div>
                )}
              </div>
              {activeColorForWall && (
                <div className="text-sm pt-2 flex items-center gap-2">
                  Applied Color: <ColorSwatch color={activeColorForWall} size="sm" className="inline-block"/> 
                  <span style={{color: activeColorForWall, fontWeight: 'bold'}}>{activeColorForWall}</span>
                </div>
              )}
              {aiRepaintedImage.suggestion && aiRepaintedImage.suggestion !== roomPhoto.dataUrl && <p className="text-xs text-muted-foreground">AI-generated preview. Actual results may vary.</p>}
            </CardContent>
          </Card>

          {/* Right Column: Controls */}
          <div className="space-y-6">
            {aiDetectedWallColors.isLoading && (
              <Alert>
                <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
                <AlertTitle>Analyzing Image</AlertTitle>
                <AlertDescription>AI is detecting wall colors...</AlertDescription>
              </Alert>
            )}
            {aiDetectedWallColors.error && (
              <Alert variant="destructive">
                <XCircle className="h-5 w-5 mr-2"/>
                <AlertTitle>Detection Error</AlertTitle>
                <AlertDescription>{aiDetectedWallColors.error}</AlertDescription>
              </Alert>
            )}
            {aiDetectedWallColors.suggestion && aiDetectedWallColors.suggestion.length > 0 && !aiDetectedWallColors.isLoading && (
              <Alert variant="default" className="border-primary/50">
                 <Info className="h-5 w-5 text-primary mr-2" />
                <AlertTitle className="text-primary">AI Detected Wall Color Info</AlertTitle>
                <AlertDescription>
                  {aiDetectedWallColors.reasoning}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {aiDetectedWallColors.suggestion.map((color, idx) => (
                      <ColorSwatch 
                        key={idx} 
                        color={color.hex} 
                        label={color.name} 
                        onClick={() => handleColorSelection(color.hex)}
                        isSelected={activeColorForWall === color.hex}
                        showCopyButton 
                        size="md"
                      />
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="aiSuggestion">AI Suggestions</TabsTrigger>
                <TabsTrigger value="chooseOwn">Choose Your Own</TabsTrigger>
              </TabsList>
              <TabsContent value="aiSuggestion" className="mt-4">
                <Card>
                  <CardHeader><CardTitle>AI Suggested Wall Colors</CardTitle></CardHeader>
                  <CardContent>
                    {aiSuggestedPalette.isLoading && <div className="flex items-center text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating suggestions...</div>}
                    {aiSuggestedPalette.error && <p className="text-sm text-destructive">{aiSuggestedPalette.error}</p>}
                    {aiSuggestedPalette.suggestion.length > 0 && !aiSuggestedPalette.isLoading && (
                      <ColorPaletteDisplay colors={aiSuggestedPalette.suggestion} onColorSelect={handleColorSelection} selectedColor={activeColorForWall} />
                    )}
                    {!aiSuggestedPalette.isLoading && aiSuggestedPalette.suggestion.length === 0 && !aiSuggestedPalette.error && <p className="text-sm text-muted-foreground">No AI suggestions available yet or image not suitable.</p>}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="chooseOwn" className="mt-4">
                <Card>
                  <CardHeader><CardTitle>Select Your Wall Color</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Input id="manual-color" type="color" value={manualColor} onChange={(e) => setManualColor(e.target.value)} className="p-1 h-10 w-16" />
                      <Input type="text" value={manualColor} onChange={(e) => setManualColor(e.target.value)} placeholder="#RRGGBB" className="max-w-[120px]" />
                      <Button onClick={handleAddManualColor} variant="outline">Add & Use Color</Button>
                    </div>
                    {userSelectedColors.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2 text-muted-foreground">Your Added Colors:</h4>
                        <div className="flex flex-wrap gap-2">
                          {userSelectedColors.map(color => (
                            <div key={color} className="relative group">
                              <ColorSwatch color={color} isSelected={color === activeColorForWall} onClick={() => handleColorSelection(color)} showCopyButton/>
                              <Button variant="destructive" size="icon" className="absolute -top-2 -right-2 h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-full" onClick={(e) => { e.stopPropagation(); handleRemoveSelectedColor(color);}}>
                                <XCircle className="h-4 w-4"/>
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            {activeColorForWall && (
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2"><Wand2 className="h-5 w-5 text-primary" />Color Harmony & Finishes</CardTitle>
                    <CardDescription>Suggestions based on your active wall color: <ColorSwatch color={activeColorForWall} size="sm" className="inline-block align-middle mx-1"/> <span style={{fontWeight:'bold', color: activeColorForWall}}>{activeColorForWall}</span></CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <Button onClick={callSuggestComplementaryColors} disabled={aiComplementary.isLoading || !activeColorForWall} className="w-full">
                        {aiComplementary.isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Palette className="mr-2 h-4 w-4" />}
                        Suggest Complementary Colors
                    </Button>
                    {aiComplementary.error && <p className="text-sm text-destructive">{aiComplementary.error}</p>}
                    {aiComplementary.suggestion.length > 0 && !aiComplementary.isLoading && (
                        <>
                        <ColorPaletteDisplay colors={aiComplementary.suggestion} title="AI Complementary Colors:"/>
                        <p className="text-xs text-muted-foreground">{aiComplementary.reasoning}</p>
                        </>
                    )}

                    <Button onClick={callSuggestSheen} disabled={aiSheen.isLoading || !activeColorForWall} className="w-full">
                        {aiSheen.isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Paintbrush className="mr-2 h-4 w-4" />}
                        Suggest Paint Sheen
                    </Button>
                    {aiSheen.error && <p className="text-sm text-destructive">{aiSheen.error}</p>}
                    {aiSheen.suggestion && !aiSheen.isLoading &&(
                        <div>
                        <h4 className="text-sm font-medium text-muted-foreground">AI Sheen Suggestion:</h4>
                        <p className="font-semibold">{aiSheen.suggestion}</p>
                        <p className="text-xs text-muted-foreground">{aiSheen.reasoning}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
            )}
          </div>
        </div>
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

