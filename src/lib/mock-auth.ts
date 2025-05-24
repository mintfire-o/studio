
import type { User, FormData, MockStoredUser } from '@/types';

// Mock user data - in a real app, this would come from a database.
const MOCK_HARDCODED_USERS: Record<string, Partial<MockStoredUser>> = {
  'designer': { id: 'user1', username: 'designer', password: 'password123', pin: '123456' },
  'testuser': { id: 'user2', username: 'testuser', password: 'test', pin: '000000' },
};

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

export async function mockLogin(credentials: FormData): Promise<User | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const storedUsers = getMockUsersFromStorage();
      const usernameLower = credentials.username.toLowerCase();
      let userToAuth: Partial<MockStoredUser> | undefined = storedUsers[usernameLower];

      if (!userToAuth) { // Fallback to hardcoded users if not found in localStorage
        userToAuth = MOCK_HARDCODED_USERS[usernameLower];
      }
      
      if (userToAuth && userToAuth.password === credentials.password && userToAuth.pin === credentials.pin) {
        // Return only non-sensitive User data
        resolve({ 
          id: userToAuth.id!, 
          username: userToAuth.username!,
          fullName: userToAuth.fullName,
          email: userToAuth.email,
        });
      } else {
        resolve(null);
      }
    }, 500); // Simulate network delay
  });
}
