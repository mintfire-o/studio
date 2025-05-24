
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUpload } from '@/components/file-upload';
import { ColorPaletteDisplay, ColorSwatch } from '@/components/color-swatch';
import type { Project, AISuggestion, DetectedWallColor, AIWallColorSuggestion, QuestionnaireAnswers } from '@/types';
import { useProjects } from '@/contexts/project-context';
import { useToast } from '@/hooks/use-toast';
import { suggestColorsFromPreferences, type SuggestColorsFromPreferencesInput } from '@/ai/flows/suggest-colors-from-preferences';
import { suggestPaintSheen, type SuggestPaintSheenInput } from '@/ai/flows/suggest-paint-sheen';
import { suggestComplementaryColors, type SuggestComplementaryColorsInput } from '@/ai/flows/suggest-complementary-colors';
import { repaintWall, type RepaintWallInput } from '@/ai/flows/repaint-wall-flow';
import { detectWallColor, type DetectWallColorInput } from '@/ai/flows/detect-wall-color-flow';
import { Loader2, Wand2, Sparkles, Save, Image as ImageIcon, Palette, XCircle, Paintbrush, Info, HelpCircle, MessageSquareQuote } from 'lucide-react';
import NextImage from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';


export default function NewProjectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');
  const { addProject, getProjectById, updateProject } = useProjects();
  const { toast } = useToast();

  const [projectName, setProjectName] = useState('');
  const [roomPhoto, setRoomPhoto] = useState<{ name: string; dataUrl: string } | null>(null);
  const [manualColor, setManualColor] = useState<string>('#FFFFFF');
  const [userSelectedColors, setUserSelectedColors] = useState<string[]>([]);

  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState<QuestionnaireAnswers>({
    favoriteColor: '',
    mood: '',
    ageRange: '',
    theme: '',
    roomType: '',
    lightingPreference: '',
  });
  const [aiPreferenceBasedPalette, setAiPreferenceBasedPalette] = useState<AISuggestion<string[]>>({ suggestion: [], reasoning: '', isLoading: false, error: null });

  const [aiDetectedWallColors, setAiDetectedWallColors] = useState<AIWallColorSuggestion>({ suggestion: [], reasoning: '', isLoading: false, error: null });
  const [aiRepaintedImage, setAiRepaintedImage] = useState<AISuggestion<string | null>>({ suggestion: null, reasoning: '', isLoading: false, error: null });
  
  const [activeColorForWall, setActiveColorForWall] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'aiPreferenceSuggestion' | 'chooseOwn' | 'aiImageSuggestion'>('aiPreferenceSuggestion');

  const [aiSheen, setAiSheen] = useState<AISuggestion<string>>({ suggestion: '', reasoning: '', isLoading: false, error: null });
  const [aiComplementary, setAiComplementary] = useState<AISuggestion<string[]>>({ suggestion: [], reasoning: '', isLoading: false, error: null });
  
  const [isEditing, setIsEditing] = useState(false);
  const [isInitialLoadForEditComplete, setIsInitialLoadForEditComplete] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
    if (!roomPhoto?.dataUrl || !activeColorForWall) return;
    setAiRepaintedImage(prev => ({ ...prev, isLoading: true, error: null, suggestion: prev.suggestion || roomPhoto.dataUrl }));
    try {
      const input: RepaintWallInput = { originalPhotoDataUri: roomPhoto.dataUrl, selectedColorHex: activeColorForWall };
      const result = await repaintWall(input);
      setAiRepaintedImage({ suggestion: result.repaintedImageDataUri, reasoning: `AI repainted with ${activeColorForWall}.`, isLoading: false, error: null });
      toast({ title: 'AI Wall Repaint Successful!', description: 'The preview has been updated.' });
    } catch (error) {
      console.error('Error repainting wall with AI:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to repaint wall with AI.';
      setAiRepaintedImage({ suggestion: roomPhoto.dataUrl, reasoning: '', isLoading: false, error: errorMessage });
      toast({ title: 'AI Repaint Error', description: errorMessage, variant: 'destructive' });
    }
  }, [roomPhoto?.dataUrl, activeColorForWall, toast]);

  const debouncedRepaint = useCallback(debounce(callAiRepaintWall, 1200), [callAiRepaintWall]);

  useEffect(() => {
    if (activeColorForWall && roomPhoto?.dataUrl && isInitialLoadForEditComplete && !aiRepaintedImage.isLoading) {
      debouncedRepaint();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeColorForWall, isInitialLoadForEditComplete]);


  const callSuggestColorsFromPreferences = useCallback(async () => {
    if (!roomPhoto?.dataUrl) {
        toast({title: "Missing Photo", description: "Please upload a room photo first.", variant: "destructive"});
        return;
    }
    // Basic validation for questionnaire
    if (Object.values(questionnaireAnswers).some(ans => ans.trim() === '')) {
        toast({title: "Incomplete Form", description: "Please fill out all preference questions.", variant: "destructive"});
        return;
    }

    setAiPreferenceBasedPalette(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const input: SuggestColorsFromPreferencesInput = {
        photoDataUri: roomPhoto.dataUrl,
        preferences: questionnaireAnswers,
      };
      const result = await suggestColorsFromPreferences(input);
      setAiPreferenceBasedPalette({ suggestion: result.palette, reasoning: result.reasoning, isLoading: false, error: null });
      setShowQuestionnaire(false); // Hide questionnaire after getting suggestions
      setActiveTab('aiPreferenceSuggestion');
      toast({ title: 'AI Color Suggestions Ready!', description: 'Check out the palette suggested based on your preferences.' });
    } catch (error) {
      console.error('Error getting preference-based suggestions:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to get AI suggestions.';
      setAiPreferenceBasedPalette({ suggestion: [], reasoning: '', isLoading: false, error: errorMessage });
      toast({ title: 'AI Suggestion Error', description: errorMessage, variant: 'destructive' });
    }
  }, [roomPhoto?.dataUrl, questionnaireAnswers, toast]);

  useEffect(() => {
    if (projectId) {
      const projectToEdit = getProjectById(projectId);
      if (projectToEdit) {
        setIsEditing(true);
        setProjectName(projectToEdit.name);
        if (projectToEdit.originalPhotoDataUri) {
          setRoomPhoto({ name: 'Uploaded room image', dataUrl: projectToEdit.originalPhotoDataUri });
          setShowQuestionnaire(false); // Assume questionnaire was filled if editing
        } else {
          setShowQuestionnaire(true); // No image, so start with questionnaire if new or image was removed
        }
        
        setUserSelectedColors(Array.from(new Set(projectToEdit.selectedColors || [])));
        
        if (projectToEdit.questionnaireAnswers) setQuestionnaireAnswers(projectToEdit.questionnaireAnswers);
        if (projectToEdit.aiSuggestedPalette) setAiPreferenceBasedPalette(projectToEdit.aiSuggestedPalette); // Using this state for primary suggestions
        
        if (projectToEdit.sheenSuggestion) setAiSheen(projectToEdit.sheenSuggestion);
        if (projectToEdit.complementaryColorsSuggestion) setAiComplementary(projectToEdit.complementaryColorsSuggestion);
        if (projectToEdit.aiDetectedWallColors) setAiDetectedWallColors(projectToEdit.aiDetectedWallColors);
        
        if (projectToEdit.aiRepaintedPhotoDataUri) {
          setAiRepaintedImage({ suggestion: projectToEdit.aiRepaintedPhotoDataUri, reasoning: 'Previously repainted by AI.', isLoading: false, error: null });
        } else if (projectToEdit.originalPhotoDataUri) {
          setAiRepaintedImage({ suggestion: projectToEdit.originalPhotoDataUri, reasoning: '', isLoading: false, error: null });
        }

        const lastActiveColor = projectToEdit.selectedColors.find(c => projectToEdit.aiRepaintedPhotoDataUri?.includes(c)) || projectToEdit.selectedColors[0] || projectToEdit.aiSuggestedPalette?.suggestion?.[0];
        if(lastActiveColor) setActiveColorForWall(lastActiveColor);

        setIsInitialLoadForEditComplete(true);
      } else {
        toast({ title: "Error", description: "Project not found.", variant: "destructive" });
        router.push('/dashboard/history');
      }
    } else {
        setIsInitialLoadForEditComplete(true);
        if (!roomPhoto) setShowQuestionnaire(true); // Show questionnaire by default for new projects until photo is up
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, getProjectById, toast, router]);


  const handleFileUpload = (fileData: { name: string; dataUrl: string }) => {
    if (fileData.dataUrl) {
      setRoomPhoto(fileData);
      setUserSelectedColors([]);
      setActiveColorForWall(null);
      setAiRepaintedImage({ suggestion: fileData.dataUrl, reasoning: '', isLoading: false, error: null });
      setAiPreferenceBasedPalette({ suggestion: [], reasoning: '', isLoading: false, error: null });
      setAiDetectedWallColors({ suggestion: [], reasoning: '', isLoading: false, error: null });
      setShowQuestionnaire(true); // Show questionnaire after new image upload
      setQuestionnaireAnswers({ favoriteColor: '', mood: '', ageRange: '', theme: '', roomType: '', lightingPreference: '' }); // Reset answers
    } else {
      setRoomPhoto(null);
      setAiRepaintedImage({ suggestion: null, reasoning: '', isLoading: false, error: null });
      setShowQuestionnaire(true); // If image removed, show questionnaire
    }
  };

  const handleColorSelection = (color: string) => {
    setActiveColorForWall(color);
    if (!userSelectedColors.includes(color)) {
      setUserSelectedColors(prev => Array.from(new Set([...prev, color])));
    }
  };
  
  const handleAddManualColor = () => {
    if (manualColor && !userSelectedColors.includes(manualColor)) {
      const newSelectedColors = [...userSelectedColors, manualColor];
      setUserSelectedColors(Array.from(new Set(newSelectedColors)));
      handleColorSelection(manualColor);
    }
  };

  const handleRemoveSelectedColor = (colorToRemove: string) => {
    setUserSelectedColors(prev => prev.filter(c => c !== colorToRemove));
    if (activeColorForWall === colorToRemove) {
      const remainingColors = userSelectedColors.filter(c => c !== colorToRemove);
      const nextActive = remainingColors.length > 0 ? remainingColors[0] : 
                         (aiPreferenceBasedPalette.suggestion.length > 0 ? aiPreferenceBasedPalette.suggestion[0] : null);
      setActiveColorForWall(nextActive);
    }
  };
  
  const handleQuestionnaireChange = (field: keyof QuestionnaireAnswers, value: string) => {
    setQuestionnaireAnswers(prev => ({ ...prev, [field]: value }));
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

  const callDetectWallColorUtility = async () => {
    if (!roomPhoto?.dataUrl) {
        toast({title: "Missing Photo", description: "Please upload a room photo first.", variant: "destructive"});
        return;
    }
    setAiDetectedWallColors(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const input: DetectWallColorInput = { photoDataUri: roomPhoto.dataUrl };
      const result = await detectWallColor(input);
      setAiDetectedWallColors({ suggestion: result.wallColors, reasoning: result.reasoning, isLoading: false, error: null });
      toast({ title: 'AI Wall Color Detection Complete!' });
    } catch (error) {
      console.error('Error detecting wall colors:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to detect wall colors.';
      setAiDetectedWallColors({ suggestion: [], reasoning: '', isLoading: false, error: errorMessage });
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
    if (aiPreferenceBasedPalette.suggestion.length === 0 && userSelectedColors.length === 0) {
        toast({ title: 'Error', description: 'Please select or get AI suggestions for colors.', variant: 'destructive' });
        return;
    }
    setIsSaving(true);
    const projectData: Project = {
      id: isEditing && projectId ? projectId : Date.now().toString(),
      name: projectName,
      roomPhotoUrl: aiRepaintedImage.suggestion || roomPhoto.dataUrl, 
      originalPhotoDataUri: roomPhoto.dataUrl,
      aiRepaintedPhotoDataUri: (aiRepaintedImage.suggestion && aiRepaintedImage.suggestion !== roomPhoto.dataUrl) ? aiRepaintedImage.suggestion : null,
      selectedColors: Array.from(new Set(userSelectedColors)),
      aiSuggestedPalette: aiPreferenceBasedPalette.suggestion.length > 0 ? aiPreferenceBasedPalette : null, // Stores preference-based suggestions
      sheenSuggestion: aiSheen.suggestion ? aiSheen : null,
      complementaryColorsSuggestion: aiComplementary.suggestion.length > 0 ? aiComplementary : null,
      aiDetectedWallColors: aiDetectedWallColors.suggestion.length > 0 ? aiDetectedWallColors : null,
      questionnaireAnswers: !Object.values(questionnaireAnswers).every(ans => ans === '') ? questionnaireAnswers : null,
      createdAt: isEditing && projectId ? getProjectById(projectId)!.createdAt : new Date().toISOString(),
    };

    if (isEditing) {
        updateProject(projectData);
        toast({ title: 'Project Updated!', description: `"${projectName}" has been successfully updated.` });
    } else {
        addProject(projectData);
        toast({ title: 'Project Saved!', description: `"${projectName}" has been added to your history.` });
    }
    setIsSaving(false);
    router.push('/dashboard/history');
  };

  const currentDisplayImage = aiRepaintedImage.suggestion || roomPhoto?.dataUrl;
  const canProceedAfterUpload = roomPhoto && !showQuestionnaire;

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

      {roomPhoto && showQuestionnaire && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2"><HelpCircle className="h-5 w-5 text-primary" />Tell Us Your Preferences</CardTitle>
            <CardDescription>Help our AI tailor color suggestions perfectly for your space and taste.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="favoriteColor">Favorite Color</Label>
                <Input id="favoriteColor" value={questionnaireAnswers.favoriteColor} onChange={(e) => handleQuestionnaireChange('favoriteColor', e.target.value)} placeholder="e.g., Sage Green or #B2D8B6" />
              </div>
              <div>
                <Label htmlFor="mood">Desired Mood</Label>
                <Select value={questionnaireAnswers.mood} onValueChange={(value) => handleQuestionnaireChange('mood', value)}>
                  <SelectTrigger><SelectValue placeholder="Select a mood" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Calm and Relaxing">Calm and Relaxing</SelectItem>
                    <SelectItem value="Energetic and Vibrant">Energetic and Vibrant</SelectItem>
                    <SelectItem value="Cozy and Warm">Cozy and Warm</SelectItem>
                    <SelectItem value="Sophisticated and Elegant">Sophisticated and Elegant</SelectItem>
                    <SelectItem value="Playful and Creative">Playful and Creative</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="ageRange">Your Age Range</Label>
                <Select value={questionnaireAnswers.ageRange} onValueChange={(value) => handleQuestionnaireChange('ageRange', value)}>
                  <SelectTrigger><SelectValue placeholder="Select age range" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="18-25">18-25</SelectItem>
                    <SelectItem value="26-35">26-35</SelectItem>
                    <SelectItem value="36-50">36-50</SelectItem>
                    <SelectItem value="50+">50+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="theme">Preferred Theme</Label>
                <Select value={questionnaireAnswers.theme} onValueChange={(value) => handleQuestionnaireChange('theme', value)}>
                  <SelectTrigger><SelectValue placeholder="Select a theme" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Modern">Modern</SelectItem>
                    <SelectItem value="Minimalist">Minimalist</SelectItem>
                    <SelectItem value="Traditional">Traditional</SelectItem>
                    <SelectItem value="Bohemian">Bohemian</SelectItem>
                    <SelectItem value="Coastal">Coastal</SelectItem>
                    <SelectItem value="Industrial">Industrial</SelectItem>
                    <SelectItem value="Scandinavian">Scandinavian</SelectItem>
                    <SelectItem value="Farmhouse">Farmhouse</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="roomType">Room Type</Label>
                 <Select value={questionnaireAnswers.roomType} onValueChange={(value) => handleQuestionnaireChange('roomType', value)}>
                  <SelectTrigger><SelectValue placeholder="Select room type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Living Room">Living Room</SelectItem>
                    <SelectItem value="Bedroom">Bedroom</SelectItem>
                    <SelectItem value="Kitchen">Kitchen</SelectItem>
                    <SelectItem value="Dining Room">Dining Room</SelectItem>
                    <SelectItem value="Home Office">Home Office</SelectItem>
                    <SelectItem value="Bathroom">Bathroom</SelectItem>
                    <SelectItem value="Kids Room">Kids Room</SelectItem>
                    <SelectItem value="Hallway">Hallway</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="lightingPreference">Desired Lighting Feel</Label>
                 <Select value={questionnaireAnswers.lightingPreference} onValueChange={(value) => handleQuestionnaireChange('lightingPreference', value)}>
                  <SelectTrigger><SelectValue placeholder="Select lighting feel" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bright and Airy">Bright and Airy</SelectItem>
                    <SelectItem value="Warm and Cozy">Warm and Cozy</SelectItem>
                    <SelectItem value="Neutral and Balanced">Neutral and Balanced</SelectItem>
                    <SelectItem value="Dramatic and Moody">Dramatic and Moody</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={callSuggestColorsFromPreferences} disabled={aiPreferenceBasedPalette.isLoading} className="w-full mt-4">
              {aiPreferenceBasedPalette.isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Get AI Color Suggestions
            </Button>
          </CardContent>
        </Card>
      )}

      {canProceedAfterUpload && (
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
              {aiRepaintedImage.suggestion && aiRepaintedImage.suggestion !== roomPhoto?.dataUrl && <p className="text-xs text-muted-foreground">AI-generated preview. Actual results may vary.</p>}
            </CardContent>
          </Card>

          {/* Right Column: Controls */}
          <div className="space-y-6">
             <Button onClick={callDetectWallColorUtility} variant="outline" className="w-full" disabled={aiDetectedWallColors.isLoading || !roomPhoto?.dataUrl}>
                {aiDetectedWallColors.isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Info className="mr-2 h-4 w-4" />}
                Detect Original Wall Colors
            </Button>

            {aiDetectedWallColors.suggestion && aiDetectedWallColors.suggestion.length > 0 && !aiDetectedWallColors.isLoading && (
              <Alert variant="default" className="border-primary/50">
                 <Info className="h-5 w-5 text-primary mr-2" />
                <AlertTitle className="text-primary">AI Detected Original Wall Colors</AlertTitle>
                <AlertDescription>
                  {aiDetectedWallColors.reasoning}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {aiDetectedWallColors.suggestion.map((color, idx) => (
                      <ColorSwatch 
                        key={`${color.hex}-${idx}-detected`} 
                        color={color.hex} 
                        label={color.name} 
                        onClick={() => handleColorSelection(color.hex)} // This will trigger repaint
                        isSelected={activeColorForWall === color.hex}
                        showCopyButton 
                        size="md"
                      />
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}
             {aiDetectedWallColors.error && (
              <Alert variant="destructive">
                <XCircle className="h-5 w-5 mr-2"/>
                <AlertTitle>Detection Error</AlertTitle>
                <AlertDescription>{aiDetectedWallColors.error}</AlertDescription>
              </Alert>
            )}


            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="aiPreferenceSuggestion">AI Preference Palette</TabsTrigger>
                <TabsTrigger value="chooseOwn">Choose Your Own</TabsTrigger>
              </TabsList>
              <TabsContent value="aiPreferenceSuggestion" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>AI Suggested Wall Colors (from Preferences)</CardTitle>
                    {aiPreferenceBasedPalette.reasoning && <CardDescription className="text-xs pt-1"><MessageSquareQuote className="inline h-3 w-3 mr-1" />{aiPreferenceBasedPalette.reasoning}</CardDescription>}
                  </CardHeader>
                  <CardContent>
                    {aiPreferenceBasedPalette.isLoading && <div className="flex items-center text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating suggestions...</div>}
                    {aiPreferenceBasedPalette.error && <p className="text-sm text-destructive">{aiPreferenceBasedPalette.error}</p>}
                    {aiPreferenceBasedPalette.suggestion.length > 0 && !aiPreferenceBasedPalette.isLoading && (
                      <ColorPaletteDisplay colors={aiPreferenceBasedPalette.suggestion} onColorSelect={handleColorSelection} selectedColor={activeColorForWall} />
                    )}
                    {!aiPreferenceBasedPalette.isLoading && aiPreferenceBasedPalette.suggestion.length === 0 && !aiPreferenceBasedPalette.error && <p className="text-sm text-muted-foreground">No AI suggestions available yet. Submit preferences or check image.</p>}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="chooseOwn" className="mt-4">
                <Card>
                  <CardHeader><CardTitle>Select Your Wall Color Manually</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Input id="manual-color" type="color" value={manualColor} onChange={(e) => setManualColor(e.target.value)} className="p-1 h-10 w-16" />
                      <Input type="text" value={manualColor} onChange={(e) => setManualColor(e.target.value)} placeholder="#RRGGBB" className="max-w-[120px]" />
                      <Button onClick={handleAddManualColor} variant="outline">Add & Use Color</Button>
                    </div>
                    {userSelectedColors.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2 text-muted-foreground">Your Added/Selected Colors:</h4>
                        <div className="flex flex-wrap gap-2">
                          {userSelectedColors.map((color, index) => (
                            <div key={`${color}-${index}-selected`} className="relative group">
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

      {canProceedAfterUpload && projectName && (
        <div className="mt-8 flex justify-end">
          <Button size="lg" onClick={handleSaveProject} className="text-lg" disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
            {isEditing ? 'Update Project' : 'Save Project'}
          </Button>
        </div>
      )}
    </div>
  );
}
