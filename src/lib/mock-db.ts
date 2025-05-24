// src/lib/mock-db.ts
import type { MockStoredUser } from '@/types';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const USERS_FILE_PATH = path.join(DATA_DIR, 'users.json');

// Ensure the data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    console.log(`Data directory created: ${DATA_DIR}`);
  } catch (error) {
    console.error(`Error creating data directory ${DATA_DIR}:`, error);
  }
}

/**
 * Reads users from the JSON file.
 * @returns {MockStoredUser[]} An array of users.
 */
export function readUsersFromFile(): MockStoredUser[] {
  try {
    if (fs.existsSync(USERS_FILE_PATH)) {
      const fileContent = fs.readFileSync(USERS_FILE_PATH, 'utf-8');
      if (fileContent.trim() === '') {
        return []; // Handle empty file
      }
      return JSON.parse(fileContent) as MockStoredUser[];
    }
    return [];
  } catch (error) {
    console.error('Error reading users from file:', error);
    // If parsing fails or other read error, return empty to avoid crashing
    // but log the error. Consider writing an empty array back to fix corruption.
    // fs.writeFileSync(USERS_FILE_PATH, JSON.stringify([], null, 2));
    return [];
  }
}

/**
 * Writes users to the JSON file.
 * @param {MockStoredUser[]} users - The array of users to write.
 */
export function writeUsersToFile(users: MockStoredUser[]): void {
  try {
    // Ensure the data directory exists before writing (might be redundant but safe)
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const fileContent = JSON.stringify(users, null, 2);
    fs.writeFileSync(USERS_FILE_PATH, fileContent, 'utf-8');
  } catch (error) {
    console.error('Error writing users to file:', error);
  }
}

/**
 * IMPORTANT: This in-memory mockUserDatabase is no longer the primary source of truth.
 * API routes will now use readUsersFromFile and writeUsersToFile.
 * This variable can be removed if not used by any other part (e.g. old direct imports).
 * For now, let's keep it to signify the shift.
 */
export const mockUserDatabase_DEPRECATED: MockStoredUser[] = [];

// Security/Deployment Note:
// Storing user data in a JSON file in the source tree is NOT SUITABLE FOR PRODUCTION.
// It's okay for local development and prototyping to simulate persistence.
// For production, a proper database (e.g., PostgreSQL, MongoDB, Firebase Firestore)
// with secure access controls and backup mechanisms is essential.
