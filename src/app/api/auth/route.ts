import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const { action, email, password, uid } = await request.json();

    if (action === 'createUser') {
      if (!email || !password) {
        return NextResponse.json(
          { error: 'Email and password are required' },
          { status: 400 }
        );
      }

      const userRecord = await adminAuth.createUser({
        email,
        password,
        emailVerified: false,
      });

      return NextResponse.json({ uid: userRecord.uid });
    }

    if (action === 'getUser') {
      if (!uid) {
        return NextResponse.json(
          { error: 'User ID is required' },
          { status: 400 }
        );
      }

      const userRecord = await adminAuth.getUser(uid);
      return NextResponse.json({ user: userRecord });
    }

    if (action === 'deleteUser') {
      if (!uid) {
        return NextResponse.json(
          { error: 'User ID is required' },
          { status: 400 }
        );
      }

      await adminAuth.deleteUser(uid);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Firebase Admin API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 