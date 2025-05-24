// src/app/api/auth/login/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import type { User } from '@/types';
import { readUsersFromFile } from '@/lib/mock-db';

export async function POST(request: NextRequest) {
  try {
    const { username, password, pin } = await request.json();

    if (!username || !password || !pin) {
      return NextResponse.json({ message: 'Username, password, and PIN are required' }, { status: 400 });
    }

    const usernameLower = username.toLowerCase();
    const users = readUsersFromFile();
    const userInDb = users.find((user) => user.username === usernameLower);

    if (!userInDb || !userInDb.passwordHash || !userInDb.pinHash) {
      return NextResponse.json({ message: 'Invalid credentials or user not found' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, userInDb.passwordHash);
    const isPinValid = await bcrypt.compare(pin, userInDb.pinHash);

    if (!isPasswordValid || !isPinValid) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const userToReturn: User = {
        id: userInDb.id,
        username: userInDb.username,
        email: userInDb.email,
        fullName: userInDb.fullName,
    };

    return NextResponse.json({ user: userToReturn, message: 'Login successful!' });
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json({ message: 'An unexpected error occurred during login.' }, { status: 500 });
  }
}
