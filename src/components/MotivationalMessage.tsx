import { Quote } from 'lucide-react';
import { getRandomQuote } from '@/lib/quotes';
import { Exercise } from '@/types/workout';

interface MotivationalMessageProps {
  exercise: Exercise;
  className?: string;
}

export function MotivationalMessage({ exercise, className = '' }: MotivationalMessageProps) {
  const quote = getRandomQuote();
  const summary = generateWorkoutSummary(exercise);
  
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-start gap-2">
        <Quote className="h-4 w-4 mt-0.5 text-blue-500" />
        <p className="text-sm font-medium">{quote}</p>
      </div>
      <p className="text-sm text-muted-foreground">{summary}</p>
    </div>
  );
}

function generateWorkoutSummary(exercise: Exercise): string {
  const totalSets = exercise.sets.length;
  const totalReps = exercise.sets.reduce((sum, set) => sum + set.reps, 0);
  const totalWeight = exercise.sets.reduce((sum, set) => sum + (set.weight * set.reps), 0);
  const avgWeightPerSet = totalWeight / totalSets;
  const avgRepsPerSet = totalReps / totalSets;

  let summary = `Great job completing ${exercise.name}! `;
  
  if (totalSets > 0) {
    summary += `You completed ${totalSets} sets with an average of ${Math.round(avgRepsPerSet)} reps per set. `;
    
    if (avgWeightPerSet > 0) {
      summary += `Your average weight per set was ${Math.round(avgWeightPerSet)}kg. `;
    }
  }

  // Add encouraging message based on workout intensity
  if (avgWeightPerSet > 50) {
    summary += "That's some serious strength training! 💪";
  } else if (avgRepsPerSet > 12) {
    summary += "Great endurance work! Keep it up! 🏃‍♂️";
  } else {
    summary += "Every rep counts towards your goals! 🌟";
  }

  return summary;
} 