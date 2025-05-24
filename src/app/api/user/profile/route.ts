// src/app/api/user/profile/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import type { UserProfile } from '@/types';
import { readUsersFromFile } from '@/lib/mock-db';

export async function GET(request: NextRequest) {
  const username = request.headers.get('X-Mock-Username');

  if (!username) {
    return NextResponse.json({ message: 'Unauthorized: Missing username header' }, { status: 401 });
  }

  try {
    const users = readUsersFromFile();
    const userInDb = users.find(u => u.username === username.toLowerCase());

    if (!userInDb) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const userProfile: UserProfile = {
      id: userInDb.id,
      username: userInDb.username,
      email: userInDb.email,
      fullName: userInDb.fullName,
      countryCode: userInDb.countryCode,
      phoneNumber: userInDb.phoneNumber,
    };

    return NextResponse.json({ user: userProfile });
  } catch (error) {
    console.error('Profile API error:', error);
    return NextResponse.json({ message: 'An unexpected error occurred while fetching the profile.' }, { status: 500 });
  }
}
