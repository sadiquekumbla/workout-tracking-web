import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

export const workoutsCollection = collection(db, 'workouts');

export async function getWorkouts(userId: string) {
  const q = query(workoutsCollection, where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

export async function addWorkout(workoutData: any) {
  const docRef = await addDoc(workoutsCollection, {
    ...workoutData,
    createdAt: new Date().toISOString()
  });
  return {
    id: docRef.id,
    ...workoutData,
    createdAt: new Date().toISOString()
  };
}

export async function updateWorkout(id: string, updateData: any) {
  const docRef = doc(workoutsCollection, id);
  await updateDoc(docRef, updateData);
  return {
    id,
    ...updateData
  };
}

export async function deleteWorkout(id: string) {
  const docRef = doc(workoutsCollection, id);
  await deleteDoc(docRef);
  return { success: true };
} 