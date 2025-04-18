'use client';

import { useState, useEffect } from 'react';
import { WorkoutList } from '@/components/WorkoutList';
import { LoginForm } from '@/components/LoginForm';
import { Workout } from '@/types/workout';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { LogOut, ArrowLeft, Trash2 } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import Link from 'next/link';
import { toast } from 'sonner';
import { User } from 'firebase/auth';
import { getWorkouts, updateWorkout, deleteWorkout } from '@/lib/firebase-client';

interface ApiResponse {
  workouts: Workout[];
  error?: string;
}

export default function WorkoutHistory() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    if (user) {
      fetchWorkouts();
    } else {
      setWorkouts([]);
    }
  }, [user]);

  const fetchWorkouts = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const workouts = await getWorkouts(user.uid);
      setWorkouts(workouts);
    } catch (error: any) {
      console.error('Error fetching workouts:', error);
      setError(error.message || 'Failed to fetch workouts');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (workoutId: string) => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const workout = workouts.find((w) => w.id === workoutId);
      if (!workout) return;

      await updateWorkout(workoutId, { completed: true });
      
      setWorkouts(
        workouts.map((w) =>
          w.id === workoutId ? { ...w, completed: true } : w
        )
      );
    } catch (error: any) {
      console.error('Error updating workout:', error);
      setError(error.message || 'Failed to update workout');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWorkout = async (workoutId: string) => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await deleteWorkout(workoutId);
      
      setWorkouts(workouts.filter((w) => w.id !== workoutId));
    } catch (error: any) {
      console.error('Error deleting workout:', error);
      setError(error.message || 'Failed to delete workout');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSet = async (workoutId: string, exerciseIndex: number, setIndex: number) => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const workout = workouts.find((w) => w.id === workoutId);
      if (!workout) return;

      // Create a copy of the workout with the set removed
      const updatedWorkout = { ...workout };
      updatedWorkout.exercises[exerciseIndex].sets.splice(setIndex, 1);
      
      // If the exercise has no sets left, remove it
      if (updatedWorkout.exercises[exerciseIndex].sets.length === 0) {
        updatedWorkout.exercises.splice(exerciseIndex, 1);
      }
      
      // If the workout has no exercises left, delete it
      if (updatedWorkout.exercises.length === 0) {
        await handleDeleteWorkout(workoutId);
        return;
      }
      
      await updateWorkout(workoutId, updatedWorkout);
      
      setWorkouts(
        workouts.map((w) =>
          w.id === workoutId ? updatedWorkout : w
        )
      );
    } catch (error: any) {
      console.error('Error deleting set:', error);
      setError(error.message || 'Failed to delete set');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAllWorkouts = async () => {
    if (!user || workouts.length === 0) return;
    
    if (!confirm('Are you sure you want to delete all workout history? This action cannot be undone.')) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Delete each workout one by one
      for (const workout of workouts) {
        await deleteWorkout(workout.id);
      }
      
      // Clear the workouts state
      setWorkouts([]);
      
      // Show success message
      toast.success('All workout history has been deleted', {
        duration: 3000,
        position: 'bottom-right',
      });
    } catch (error: any) {
      console.error('Error deleting all workouts:', error);
      setError(error.message || 'Failed to delete all workouts');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <main className="container mx-auto p-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 text-center">Workout Tracker</h1>
        <LoginForm />
      </main>
    );
  }

  return (
    <main className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold">Workout History</h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="outline" onClick={logout} className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md">
          {error}
        </div>
      )}
      
      <div className="bg-card rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Your Workout History</h2>
          {workouts.length > 0 && (
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleDeleteAllWorkouts}
              className="flex items-center gap-2"
              disabled={loading}
            >
              <Trash2 className="h-4 w-4" />
              Delete All History
            </Button>
          )}
        </div>
        {loading ? (
          <p className="text-center text-muted-foreground">Loading workouts...</p>
        ) : workouts.length === 0 ? (
          <p className="text-center text-muted-foreground">No workouts found. Add your first workout on the home page.</p>
        ) : (
          <WorkoutList
            workouts={workouts}
            onToggleComplete={handleToggleComplete}
            onDelete={handleDeleteWorkout}
            onDeleteSet={handleDeleteSet}
          />
        )}
      </div>
    </main>
  );
} 