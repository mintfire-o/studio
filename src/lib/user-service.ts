
// src/lib/user-service.ts
'use client'; // Important as it uses localStorage

import type { MockStoredUser } from '@/types';

const MOCK_USERS_DB_KEY = 'laInteriorMockUsersDB';

const getMockUsersFromStorage = (): Record<string, MockStoredUser> => {
  if (typeof window !== 'undefined') {
    try {
      const storedUsers = localStorage.getItem(MOCK_USERS_DB_KEY);
      return storedUsers ? JSON.parse(storedUsers) : {};
    } catch (e) {
      console.error("Error reading mock users from localStorage", e);
      return {};
    }
  }
  return {};
};

const saveMockUsersToStorage = (users: Record<string, MockStoredUser>) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(MOCK_USERS_DB_KEY, JSON.stringify(users));
    } catch (e) {
      console.error("Error saving mock users to localStorage", e);
    }
  }
};

export const getUserDetails = (username: string): MockStoredUser | null => {
  if (typeof window === 'undefined') return null; // Guard against server-side execution
  const users = getMockUsersFromStorage();
  const usernameLower = username.toLowerCase();
  return users[usernameLower] || null;
};

export const updateUserDetails = (
  username: string,
  updates: Partial<Pick<MockStoredUser, 'password' | 'pin' | 'fullName' | 'email' | 'phoneNumber' | 'countryCode'>>
): boolean => {
  if (typeof window === 'undefined') return false; // Guard against server-side execution
  const users = getMockUsersFromStorage();
  const usernameLower = username.toLowerCase();
  const userToUpdate = users[usernameLower];

  if (!userToUpdate) {
    return false; // User not found
  }

  // Update specified fields
  const updatedUser = { ...userToUpdate, ...updates };
  users[usernameLower] = updatedUser;
  saveMockUsersToStorage(users);
  return true;
};
