import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const workoutsSnapshot = await adminDb
      .collection('workouts')
      .where('userId', '==', userId)
      .get();

    const workouts = workoutsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ workouts });
  } catch (error: any) {
    console.error('Firebase Admin API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const workoutData = await request.json();
    
    if (!workoutData.userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const docRef = await adminDb.collection('workouts').add({
      ...workoutData,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({ 
      id: docRef.id,
      ...workoutData,
      createdAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Firebase Admin API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...updateData } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Workout ID is required' },
        { status: 400 }
      );
    }

    await adminDb.collection('workouts').doc(id).update(updateData);

    return NextResponse.json({ 
      id,
      ...updateData
    });
  } catch (error: any) {
    console.error('Firebase Admin API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Workout ID is required' },
        { status: 400 }
      );
    }

    await adminDb.collection('workouts').doc(id).delete();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Firebase Admin API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 