"use client"

import { Workout } from '@/types/workout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, ChevronDown, ChevronUp, Dumbbell, Calendar, Clock, TrendingUp, Activity, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';

interface WorkoutListProps {
  workouts: Workout[];
  onDelete: (workoutId: string) => void;
  onDeleteSet: (workoutId: string, exerciseIndex: number, setIndex: number) => void;
}

export function WorkoutList({
  workouts,
  onDelete,
  onDeleteSet
}: WorkoutListProps) {
  const [expandedWorkouts, setExpandedWorkouts] = useState<Set<string>>(new Set());
  const sortedWorkouts = [...workouts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const toggleWorkout = (workoutId: string) => {
    setExpandedWorkouts(prev => {
      const next = new Set(prev);
      if (next.has(workoutId)) {
        next.delete(workoutId);
      } else {
        next.add(workoutId);
      }
      return next;
    });
  };

  // Calculate workout summary and analysis
  const calculateWorkoutSummary = (workout: Workout) => {
    const totalExercises = workout.exercises.length;
    const totalSets = workout.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
    const totalReps = workout.exercises.reduce((acc, ex) => 
      acc + ex.sets.reduce((setAcc, set) => setAcc + set.reps, 0), 0);
    const totalWeight = workout.exercises.reduce((acc, ex) => 
      acc + ex.sets.reduce((setAcc, set) => setAcc + (set.weight * set.reps), 0), 0);
    
    // Calculate completed sets
    const completedSets = workout.exercises.reduce((acc, ex) => 
      acc + ex.sets.reduce((setAcc, set) => setAcc + (set.completed ? 1 : 0), 0), 0);
    
    // Calculate completion percentage
    const completionPercentage = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;
    
    // Calculate intensity (average weight per rep)
    const intensity = totalReps > 0 ? Math.round(totalWeight / totalReps) : 0;
    
    // Calculate volume (weight × reps)
    const volume = totalWeight;
    
    // Determine workout type based on exercises
    const exerciseTypes = new Set(workout.exercises.map(ex => {
      const name = ex.name.toLowerCase();
      if (name.includes('bench') || name.includes('press')) return 'push';
      if (name.includes('row') || name.includes('pull') || name.includes('curl')) return 'pull';
      if (name.includes('squat') || name.includes('leg') || name.includes('deadlift')) return 'legs';
      return 'other';
    }));
    
    const workoutType = Array.from(exerciseTypes).join(', ');
    
    return {
      totalExercises,
      totalSets,
      totalReps,
      totalWeight,
      completedSets,
      completionPercentage,
      avgWeightPerSet: totalSets > 0 ? Math.round(totalWeight / totalSets) : 0,
      intensity,
      volume,
      workoutType
    };
  };

  return (
    <div className="space-y-3">
      {sortedWorkouts.map((workout) => {
        const isExpanded = expandedWorkouts.has(workout.id);
        const summary = calculateWorkoutSummary(workout);
        const workoutDate = new Date(workout.date);
        const dayOfWeek = format(workoutDate, 'EEEE');
        const formattedDate = format(workoutDate, 'MMMM d, yyyy');

        return (
          <Card 
            key={workout.id} 
            className="overflow-hidden transition-all duration-200 hover:shadow-md dark:bg-gray-800/50 dark:border-gray-700/50"
          >
            <div 
              className="p-4 cursor-pointer"
              onClick={() => toggleWorkout(workout.id)}
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium dark:text-gray-100">
                      {dayOfWeek}, {formattedDate}
                    </h3>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Dumbbell className="h-3.5 w-3.5" />
                      <span>{summary.totalExercises} exercise{summary.totalExercises !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{summary.totalSets} set{summary.totalSets !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>{summary.completionPercentage}% complete</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(workout.id);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </div>
            </div>

            {isExpanded && (
              <div className="border-t dark:border-gray-700/50">
                <div className="p-4 space-y-4">
                  {/* Workout Summary */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-muted/30 dark:bg-gray-800/30 rounded-lg">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground dark:text-gray-400">Total Exercises</p>
                      <p className="text-lg font-medium dark:text-gray-200">{summary.totalExercises}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground dark:text-gray-400">Total Sets</p>
                      <p className="text-lg font-medium dark:text-gray-200">{summary.totalSets}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground dark:text-gray-400">Status</p>
                      <p className="text-lg font-medium dark:text-gray-200 flex items-center gap-1">
                        {summary.completedSets}/{summary.totalSets}
                        <span className="text-xs text-muted-foreground">({summary.completionPercentage}%)</span>
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground dark:text-gray-400">Total Reps</p>
                      <p className="text-lg font-medium dark:text-gray-200">{summary.totalReps}</p>
                    </div>
                  </div>

                  {/* Workout Analysis */}
                  <div className="p-3 bg-muted/30 dark:bg-gray-800/30 rounded-lg space-y-3">
                    <h4 className="font-medium text-sm dark:text-gray-200 flex items-center gap-1">
                      <Activity className="h-4 w-4" />
                      Workout Analysis
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground dark:text-gray-400">Workout Type</p>
                        <p className="text-sm font-medium dark:text-gray-200 capitalize">{summary.workoutType}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground dark:text-gray-400">Intensity</p>
                        <p className="text-sm font-medium dark:text-gray-200">{summary.intensity} kg/rep</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground dark:text-gray-400">Volume</p>
                        <p className="text-sm font-medium dark:text-gray-200">{summary.volume} kg</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground dark:text-gray-400">Efficiency</p>
                        <p className="text-sm font-medium dark:text-gray-200">
                          {summary.totalSets > 0 ? Math.round(summary.totalReps / summary.totalSets) : 0} reps/set
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Exercise List (without details) */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm dark:text-gray-200">Exercises</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {workout.exercises.map((exercise, index) => {
                        const completedSets = exercise.sets.filter(set => set.completed).length;
                        const completionPercentage = exercise.sets.length > 0 
                          ? Math.round((completedSets / exercise.sets.length) * 100) 
                          : 0;
                        
                        return (
                          <div key={index} className="p-2 bg-muted/20 dark:bg-gray-800/20 rounded-md">
                            <div className="flex justify-between items-center">
                              <p className="text-sm dark:text-gray-200">{exercise.name}</p>
                              <div className="flex items-center gap-1">
                                <CheckCircle2 className={`h-3 w-3 ${completionPercentage === 100 ? 'text-green-500' : 'text-muted-foreground'}`} />
                                <span className="text-xs text-muted-foreground dark:text-gray-400">
                                  {completedSets}/{exercise.sets.length}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {workout.notes && (
                    <div className="pt-2 border-t dark:border-gray-700/50">
                      <p className="text-sm text-muted-foreground dark:text-gray-400">{workout.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
} 