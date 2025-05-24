// src/app/api/user/profile/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import type { UserProfile } from '@/types';
import { mockUserDatabase } from '@/lib/mock-db'; // Use shared mock DB

export async function GET(request: NextRequest) {
  // In a real app, you'd get the authenticated user ID from a session token (e.g., JWT)
  // For this mock, we'll rely on a custom header (NOT FOR PRODUCTION)
  const username = request.headers.get('X-Mock-Username');

  if (!username) {
    return NextResponse.json({ message: 'Unauthorized: Missing username header' }, { status: 401 });
  }

  try {
    // --- Mock In-Memory Store Logic ---
    const userInDb = mockUserDatabase.find(u => u.username === username.toLowerCase());

    if (!userInDb) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    // --- End Mock Logic ---

    // console.log('Fetching profile for:', username, userInDb); // For debugging

    // Return profile data (excluding sensitive hashes)
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
