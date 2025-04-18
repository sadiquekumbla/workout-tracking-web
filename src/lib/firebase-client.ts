import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, DocumentData } from 'firebase/firestore';
import { Workout } from '@/types/workout';

export const workoutsCollection = collection(db, 'workouts');

export async function getWorkouts(userId: string): Promise<Workout[]> {
  try {
    const q = query(workoutsCollection, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Workout[];
  } catch (error: any) {
    console.error('Error getting workouts:', error);
    throw new Error(error.message || 'Failed to get workouts');
  }
}

export async function addWorkout(workoutData: Omit<Workout, 'id'>): Promise<Workout> {
  try {
    const docRef = await addDoc(workoutsCollection, {
      ...workoutData,
      createdAt: new Date().toISOString()
    });
    return {
      id: docRef.id,
      ...workoutData,
      createdAt: new Date().toISOString()
    };
  } catch (error: any) {
    console.error('Error adding workout:', error);
    throw new Error(error.message || 'Failed to add workout');
  }
}

export async function updateWorkout(id: string, updateData: Partial<Workout>): Promise<Workout> {
  try {
    const docRef = doc(workoutsCollection, id);
    await updateDoc(docRef, updateData);
    return {
      id,
      ...updateData
    } as Workout;
  } catch (error: any) {
    console.error('Error updating workout:', error);
    throw new Error(error.message || 'Failed to update workout');
  }
}

export async function deleteWorkout(id: string): Promise<{ success: boolean }> {
  try {
    const docRef = doc(workoutsCollection, id);
    await deleteDoc(docRef);
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting workout:', error);
    throw new Error(error.message || 'Failed to delete workout');
  }
} 