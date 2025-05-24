export interface User {
  id: string;
  username: string;
  // In a real app, never store raw PINs or passwords
}

export interface AISuggestion<T> {
  suggestion: T;
  reasoning: string;
  isLoading: boolean;
  error?: string | null;
}

export interface Project {
  id: string;
  name: string;
  roomPhotoUrl: string; // Data URI or uploaded file URL - this will be the primary display image
  originalPhotoDataUri: string; // Base64 data URI for AI processing (original upload)
  aiRepaintedPhotoDataUri?: string | null; // Data URI of AI-repainted image
  selectedColors: string[]; // hex codes
  aiSuggestedPalette: AISuggestion<string[]> | null;
  sheenSuggestion: AISuggestion<string> | null;
  complementaryColorsSuggestion: AISuggestion<string[]> | null;
  createdAt: string; // ISO date string
}

// Simplified for MVP
export interface FormData {
  username: string;
  password?: string; // Optional for now
  pin?: string; // Optional for now
}

