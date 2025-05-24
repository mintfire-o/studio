
import type { User, FormData, MockStoredUser } from '@/types';

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
      const userToAuth: MockStoredUser | undefined = storedUsers[usernameLower];

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
