'use client';

import { useState, useEffect } from 'react';
import { WorkoutForm } from '@/components/WorkoutForm';
import { LoginForm } from '@/components/LoginForm';
import { Workout } from '@/types/workout';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { LogOut, History } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import Link from 'next/link';
import { toast } from 'sonner';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, logout } = useAuth();

  const handleAddWorkout = async (workoutData: Omit<Workout, 'id'>) => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const workoutWithUser = {
        ...workoutData,
        userId: user.uid,
        createdAt: new Date().toISOString()
      };
      
      const response = await fetch('/api/workouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workoutWithUser),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add workout');
      }
      
      toast.success('Workout added successfully!', {
        duration: 3000,
        position: 'bottom-right',
      });
    } catch (error: any) {
      console.error('Error adding workout:', error);
      setError(error.message || 'Failed to add workout');
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
        <h1 className="text-3xl font-bold">Workout Tracker</h1>
        <div className="flex items-center gap-2">
          <Link href="/history" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <History className="h-4 w-4" />
            View History
          </Link>
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
        <h2 className="text-xl font-semibold mb-4">Add Workout</h2>
        <WorkoutForm onSubmit={handleAddWorkout} />
      </div>
    </main>
  );
}
