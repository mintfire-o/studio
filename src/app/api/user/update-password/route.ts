// src/app/api/user/update-password/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { readUsersFromFile, writeUsersToFile } from '@/lib/mock-db';

export async function POST(request: NextRequest) {
  const username = request.headers.get('X-Mock-Username');
  if (!username) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ message: 'Current password and new password are required' }, { status: 400 });
    }
    if (newPassword.length < 6) {
        return NextResponse.json({ message: 'New password must be at least 6 characters long' }, { status: 400 });
    }

    let users = readUsersFromFile();
    const userIndex = users.findIndex(u => u.username === username.toLowerCase());
    if (userIndex === -1) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const userInDb = users[userIndex];

    if (!userInDb.passwordHash) {
        return NextResponse.json({ message: 'User record incomplete, cannot verify password.' }, { status: 500 });
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, userInDb.passwordHash);
    if (!isCurrentPasswordValid) {
      return NextResponse.json({ message: 'Incorrect current password' }, { status: 403 });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    users[userIndex] = { ...userInDb, passwordHash: newPasswordHash };
    writeUsersToFile(users);

    return NextResponse.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Update Password API error:', error);
    return NextResponse.json({ message: 'An unexpected error occurred while updating password.' }, { status: 500 });
  }
}
