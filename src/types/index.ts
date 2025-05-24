
export interface User {
  id: string;
  username: string; // This might represent full name after account creation for mock purposes
  email?: string;
  // In a real app, never store raw PINs or passwords
}

export interface AISuggestion<T> {
  suggestion: T;
  reasoning: string;
  isLoading: boolean;
  error?: string | null;
}

export interface DetectedWallColor {
  hex: string;
  name: string;
}

export interface AIWallColorSuggestion extends AISuggestion<DetectedWallColor[]> {
  // suggestion will be an array of DetectedWallColor
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
  aiDetectedWallColors?: AIWallColorSuggestion | null; // Added for detected wall colors
  createdAt: string; // ISO date string
}

// FormData for both login and create account (mock)
export interface FormData {
  username: string; // Used for full name in creation, username in login
  email?: string;
  phoneNumber?: string;
  password?: string;
  pin?: string;
}

    