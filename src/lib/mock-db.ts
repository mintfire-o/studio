// src/lib/mock-db.ts
import type { MockStoredUser } from '@/types';

/**
 * This is a shared in-memory store for mock user data.
 * IMPORTANT: Data stored here will be lost if the server restarts.
 * For persistent storage, a real database (e.g., PostgreSQL) is required.
 */
export const mockUserDatabase: MockStoredUser[] = [];
