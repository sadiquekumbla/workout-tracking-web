import { Exercise } from '@/types/workout';

const motivationalQuotes = [
  "The only bad workout is the one that didn't happen.",
  "Your body can stand almost anything. It's your mind you have to convince.",
  "The hard days are what make you stronger.",
  "Success starts with self-discipline.",
  "Your health is an investment, not an expense.",
  "The only person you are destined to become is the person you decide to be.",
  "Don't wish for it. Work for it.",
  "Your future self is watching you right now through memories.",
  "The difference between try and triumph is just a little umph!",
  "Pain is temporary. Quitting lasts forever.",
  "The only limit is the one you set yourself.",
  "Your body hears everything your mind says.",
  "Fall in love with the process of becoming the very best version of yourself.",
  "The hard days are the best because that's when champions are made.",
  "You are stronger than you think.",
];

export function getRandomQuote(): string {
  const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
  return motivationalQuotes[randomIndex];
}

export function generateWorkoutSummary(exercise: Exercise): string {
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