

export interface User {
  id: string;
  username: string; 
  fullName?: string; 
  email?: string;
}

// For storing in localStorage, including mock credentials
export interface MockStoredUser extends User {
  password?: string; // In a REAL app, this would be a HASH, never plaintext
  pin?: string;      // In a REAL app, PINs also need secure handling
  countryCode?: string;
  phoneNumber?: string;
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
  roomPhotoUrl: string; 
  originalPhotoDataUri: string; 
  aiRepaintedPhotoDataUri?: string | null; 
  selectedColors: string[]; 
  aiSuggestedPalette: AISuggestion<string[]> | null;
  sheenSuggestion: AISuggestion<string> | null;
  complementaryColorsSuggestion: AISuggestion<string[]> | null;
  aiDetectedWallColors?: AIWallColorSuggestion | null; 
  createdAt: string; 
}

export interface FormData {
  fullName?: string; 
  username: string; 
  email?: string; 
  countryCode?: string; 
  phoneNumber?: string; 
  password?: string; 
  pin?: string;
}

