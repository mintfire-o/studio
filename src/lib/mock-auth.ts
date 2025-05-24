import type { User, FormData } from '@/types';

// Mock user data - in a real app, this would come from a database.
const MOCK_USERS: Record<string, Partial<User> & { password?: string; pin?: string }> = {
  'designer': { id: 'user1', username: 'designer', password: 'password123', pin: '123456' },
  'testuser': { id: 'user2', username: 'testuser', password: 'test', pin: '000000' },
};

export async function mockLogin(credentials: FormData): Promise<User | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const user = MOCK_USERS[credentials.username.toLowerCase()];
      if (user && user.password === credentials.password && user.pin === credentials.pin) {
        resolve({ id: user.id!, username: user.username! });
      } else {
        resolve(null);
      }
    }, 500); // Simulate network delay
  });
}
