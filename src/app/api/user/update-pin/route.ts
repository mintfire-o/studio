// src/app/api/user/update-pin/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { mockUserDatabase } from '@/lib/mock-db'; // Use shared mock DB

export async function POST(request: NextRequest) {
  const username = request.headers.get('X-Mock-Username'); // Mock auth
  if (!username) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { currentPin, newPin } = await request.json();

    if (!currentPin || !newPin) {
      return NextResponse.json({ message: 'Current PIN and new PIN are required' }, { status: 400 });
    }
    if (!/^\d{6}$/.test(newPin)) {
        return NextResponse.json({ message: 'New PIN must be exactly 6 digits' }, { status: 400 });
    }


    // --- Mock In-Memory Store Logic ---
    const userIndex = mockUserDatabase.findIndex(u => u.username === username.toLowerCase());
    if (userIndex === -1) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const userInDb = mockUserDatabase[userIndex];

    if (!userInDb.pinHash) {
        return NextResponse.json({ message: 'User record incomplete, cannot verify PIN.' }, { status: 500 });
    }

    const isCurrentPinValid = await bcrypt.compare(currentPin, userInDb.pinHash);
    if (!isCurrentPinValid) {
      return NextResponse.json({ message: 'Incorrect current PIN' }, { status: 403 });
    }

    const newPinHash = await bcrypt.hash(newPin, 10);
    mockUserDatabase[userIndex] = { ...userInDb, pinHash: newPinHash };
    // --- End Mock Logic ---

    // console.log('PIN updated for:', username); // For debugging

    return NextResponse.json({ message: 'PIN updated successfully' });
  } catch (error) {
    console.error('Update PIN API error:', error);
    return NextResponse.json({ message: 'An unexpected error occurred while updating PIN.' }, { status: 500 });
  }
}
