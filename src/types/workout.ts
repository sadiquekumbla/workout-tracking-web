export interface Exercise {
  name: string;
  sets: {
    reps: number;
    weight: number;
    completed: boolean;
  }[];
}

export interface Workout {
  id: string;
  userId: string;
  date: string;
  exercises: Exercise[];
  completed: boolean;
  notes?: string;
  imageUrl?: string;
  createdAt: string;
} 