
export interface User {
  id: string;
  username: string;
  fullName?: string;
  email?: string;
}

// For storing in our mock in-memory "database" (mock-db.ts)
export interface MockStoredUser {
  id: string;
  username: string;
  email?: string;
  passwordHash?: string; // Stores the bcrypt hash of the password
  pinHash?: string;      // Stores the bcrypt hash of the PIN
  fullName?: string;
  countryCode?: string;
  phoneNumber?: string;
}

// For displaying on the profile page (excludes sensitive hashes)
export interface UserProfile extends User {
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
