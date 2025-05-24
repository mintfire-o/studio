// src/app/api/auth/register/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import type { MockStoredUser, User } from '@/types';
import { readUsersFromFile, writeUsersToFile } from '@/lib/mock-db';

export async function POST(request: NextRequest) {
  try {
    const { fullName, username, email, countryCode, phoneNumber, password, pin } = await request.json();

    if (!username || !password || !pin || !email) {
      return NextResponse.json({ message: 'Username, email, password, and PIN are required' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ message: 'Password must be at least 6 characters long' }, { status: 400 });
    }
    if (!/^\d{6}$/.test(pin)) {
        return NextResponse.json({ message: 'PIN must be exactly 6 digits' }, { status: 400 });
    }
    if (!/^[^\s@]+@gmail\.com$/.test(email)) {
        return NextResponse.json({ message: 'Please enter a valid @gmail.com email address.' }, { status: 400 });
    }

    const usernameLower = username.toLowerCase();
    const emailLower = email.toLowerCase();

    let users = readUsersFromFile();

    const existingUser = users.find(
      (user) => user.username === usernameLower || (user.email && user.email.toLowerCase() === emailLower)
    );

    if (existingUser) {
      const message = existingUser.username === usernameLower
        ? 'Username already taken'
        : 'Email already registered';
      return NextResponse.json({ message }, { status: 409 }); // 409 Conflict
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const pinHash = await bcrypt.hash(pin, 10);

    const newUser: MockStoredUser = {
      id: Date.now().toString(), // Simple ID generation
      username: usernameLower,
      email: emailLower,
      passwordHash,
      pinHash,
      fullName,
      countryCode,
      phoneNumber,
    };
    users.push(newUser);
    writeUsersToFile(users);

    const userToReturn: User = {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        fullName: newUser.fullName,
    };

    return NextResponse.json({ user: userToReturn, message: 'Account created successfully!' }, { status: 201 });
  } catch (error) {
    console.error('Registration API error:', error);
    return NextResponse.json({ message: 'An unexpected error occurred during registration.' }, { status: 500 });
  }
}
