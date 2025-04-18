interface ParsedExercise {
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  unit?: string;
  serialNumber?: number;
  focus?: string;
  rest?: string;
  notes?: string;
  isTimeBased?: boolean;
  duration?: number; // in seconds
}

export function parseWorkoutText(text: string): ParsedExercise[] {
  // First, check if the text contains "---" separators
  if (text.includes('---')) {
    // Split by "---" to separate sections
    const sections = text.split('---').map(section => section.trim()).filter(section => section.length > 0);
    
    const exercises: ParsedExercise[] = [];
    
    for (const section of sections) {
      // Skip if it's just a section header (e.g., "Chest Workouts")
      if (section.includes("Workouts") || section.includes("Finisher")) {
        continue;
      }
      
      // Extract exercise name (first line)
      const lines = section.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      if (lines.length === 0) continue;
      
      const exerciseName = lines[0];
      
      // Initialize exercise object
      const exercise: ParsedExercise = {
        name: exerciseName,
        sets: 0,
        reps: 0,
        isTimeBased: false
      };
      
      // Parse the rest of the lines for additional information
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        
        // Extract focus
        if (line.startsWith('Focus:')) {
          exercise.focus = line.substring(6).trim();
          continue;
        }
        
        // Extract sets and reps
        if (line.startsWith('Sets:')) {
          const setsInfo = line.substring(5).trim();
          
          // Handle formats like "3 (12 – 12 – 10 reps)"
          const setsMatch = setsInfo.match(/^(\d+)\s*\(([\d\s–]+)\s*reps?\)$/);
          if (setsMatch) {
            exercise.sets = parseInt(setsMatch[1]);
            // Take the first rep count as default
            const repsList = setsMatch[2].split('–').map(r => parseInt(r.trim()));
            exercise.reps = repsList[0] || 0;
            continue;
          }
          
          // Handle formats like "2 sets x 10–15 reps"
          const setsRepsMatch = setsInfo.match(/^(\d+)\s*sets?\s*x\s*([\d–]+)\s*reps?$/);
          if (setsRepsMatch) {
            exercise.sets = parseInt(setsRepsMatch[1]);
            // Take the first rep count as default
            const repsRange = setsRepsMatch[2].split('–');
            exercise.reps = parseInt(repsRange[0]) || 0;
            continue;
          }
          
          // Handle formats like "2 x 45 sec" - time-based exercises
          const timeMatch = setsInfo.match(/^(\d+)\s*x\s*(\d+)\s*sec$/);
          if (timeMatch) {
            exercise.sets = parseInt(timeMatch[1]);
            exercise.reps = 0; // No reps for time-based exercises
            exercise.isTimeBased = true;
            exercise.duration = parseInt(timeMatch[2]);
            continue;
          }
        }
        
        // Extract weight
        if (line.startsWith('Weight suggestion:')) {
          const weightInfo = line.substring(17).trim();
          const weightMatch = weightInfo.match(/^(\d+(?:\.\d+)?)\s*(?:–\s*\d+(?:\.\d+)?)?\s*(?:–\s*\d+(?:\.\d+)?)?\s*(kg|lbs)$/);
          if (weightMatch) {
            exercise.weight = parseFloat(weightMatch[1]);
            exercise.unit = weightMatch[2];
            continue;
          }
        }
        
        // Extract rest
        if (line.startsWith('Rest:')) {
          exercise.rest = line.substring(5).trim();
          continue;
        }
        
        // Handle "Max reps" format
        if (line.includes('Max reps')) {
          const maxRepsMatch = line.match(/Max reps x (\d+) sets/);
          if (maxRepsMatch) {
            exercise.sets = parseInt(maxRepsMatch[1]);
            exercise.reps = 0; // We don't know the exact reps for max reps
            continue;
          }
        }
      }
      
      // If we couldn't extract sets and reps from the detailed format,
      // try the original simple format as a fallback
      if (exercise.sets === 0 && exercise.reps === 0) {
        // Try different regex patterns to match various formats
        
        // Pattern 1: "Bench press 3x10 60kg" or "Squats 3x12 100kg"
        const pattern1 = /^(.+?)\s+(\d+)x(\d+)(?:\s+(\d+)(kg|lbs))?$/i;
        
        // Pattern 2: "Bench press 3 sets of 10 reps at 60kg"
        const pattern2 = /^(.+?)\s+(\d+)\s+sets?\s+of\s+(\d+)\s+reps?(?:\s+at\s+(\d+)(kg|lbs))?$/i;
        
        // Pattern 3: "Bench press 3 sets 10 reps 60kg"
        const pattern3 = /^(.+?)\s+(\d+)\s+sets?\s+(\d+)\s+reps?(?:\s+(\d+)(kg|lbs))?$/i;
        
        // Pattern 4: "Bench press 60kg 3x10"
        const pattern4 = /^(.+?)\s+(\d+)(kg|lbs)\s+(\d+)x(\d+)$/i;
        
        // Pattern 5: "Bench press 60kg"
        const pattern5 = /^(.+?)\s+(\d+)(kg|lbs)$/i;
        
        // Pattern 6: "Bench press 3x10"
        const pattern6 = /^(.+?)\s+(\d+)x(\d+)$/i;
        
        // Pattern 7: "Plank 3x45sec" or "Push-ups 3x30sec"
        const pattern7 = /^(.+?)\s+(\d+)x(\d+)(sec|s)$/i;
        
        // Try each pattern in order
        let match = exerciseName.match(pattern1);
        let patternUsed = 1;
        
        if (!match) {
          match = exerciseName.match(pattern2);
          patternUsed = 2;
        }
        
        if (!match) {
          match = exerciseName.match(pattern3);
          patternUsed = 3;
        }
        
        if (!match) {
          match = exerciseName.match(pattern4);
          patternUsed = 4;
        }
        
        if (!match) {
          match = exerciseName.match(pattern5);
          patternUsed = 5;
        }
        
        if (!match) {
          match = exerciseName.match(pattern6);
          patternUsed = 6;
        }
        
        if (!match) {
          match = exerciseName.match(pattern7);
          patternUsed = 7;
        }
        
        if (match) {
          let name, sets, reps, weight, unit;
          
          if (patternUsed === 4) {
            // Pattern 4: "Bench press 60kg 3x10"
            [, name, weight, unit, sets, reps] = match;
          } else if (patternUsed === 5) {
            // Pattern 5: "Bench press 60kg"
            [, name, weight, unit] = match;
            sets = "0";
            reps = "0";
          } else if (patternUsed === 6) {
            // Pattern 6: "Bench press 3x10"
            [, name, sets, reps] = match;
            weight = undefined;
            unit = undefined;
          } else if (patternUsed === 7) {
            // Pattern 7: "Plank 3x45sec"
            [, name, sets, reps, unit] = match;
            exercise.isTimeBased = true;
            exercise.duration = parseInt(reps);
            reps = "0"; // Set reps to 0 for time-based exercises
          } else {
            // Patterns 1-3: "Bench press 3x10 60kg" or similar
            [, name, sets, reps, weight, unit] = match;
          }
          
          exercise.name = name.trim();
          exercise.sets = parseInt(sets);
          exercise.reps = parseInt(reps);
          exercise.weight = weight ? parseFloat(weight) : undefined;
          exercise.unit = unit || undefined;
        }
      }
      
      // Check if this is a time-based exercise by name
      if (!exercise.isTimeBased) {
        const timeBasedKeywords = [
          'plank', 'push-up', 'pushup', 'wall sit', 'wall sit', 'wall squat',
          'bridge', 'glute bridge', 'superman', 'bird dog', 'dead bug',
          'hollow hold', 'side plank', 'mountain climber', 'burpee'
        ];
        
        const exerciseNameLower = exercise.name.toLowerCase();
        for (const keyword of timeBasedKeywords) {
          if (exerciseNameLower.includes(keyword)) {
            exercise.isTimeBased = true;
            // Default to 30 seconds if no duration is specified
            exercise.duration = exercise.duration || 30;
            break;
          }
        }
      }
      
      exercises.push(exercise);
    }
    
    return exercises;
  } else {
    // Handle comma-separated format
    // First, split by commas to get potential exercise blocks
    const blocks = text.split(',').map(block => block.trim()).filter(block => block.length > 0);
    
    const exercises: ParsedExercise[] = [];
    let currentExercise: ParsedExercise | null = null;
    
    for (const block of blocks) {
      // Skip empty blocks or blocks that are just "---"
      if (block === '' || block === '---') {
        continue;
      }
      
      // Check if this block starts with a new exercise name
      // Exercise names typically don't start with keywords like "Focus:", "Sets:", etc.
      if (!block.startsWith('Focus:') && 
          !block.startsWith('Sets:') && 
          !block.startsWith('Rest:') && 
          !block.startsWith('Weight suggestion:') &&
          !block.includes('Max reps')) {
        
        // If we have a current exercise, add it to the list
        if (currentExercise) {
          exercises.push(currentExercise);
        }
        
        // Start a new exercise
        currentExercise = {
          name: block,
          sets: 0,
          reps: 0,
          isTimeBased: false
        };
        
        // Try to extract sets, reps, and weight from the exercise name
        // This helps with formats like "Bench press 3x10 60kg" in a comma-separated list
        extractExerciseDetailsFromName(currentExercise);
      } else if (currentExercise) {
        // This is additional information for the current exercise
        
        // Extract focus
        if (block.startsWith('Focus:')) {
          currentExercise.focus = block.substring(6).trim();
          continue;
        }
        
        // Extract sets and reps
        if (block.startsWith('Sets:')) {
          const setsInfo = block.substring(5).trim();
          
          // Handle formats like "3 (12 – 12 – 10 reps)"
          const setsMatch = setsInfo.match(/^(\d+)\s*\(([\d\s–]+)\s*reps?\)$/);
          if (setsMatch) {
            currentExercise.sets = parseInt(setsMatch[1]);
            // Take the first rep count as default
            const repsList = setsMatch[2].split('–').map(r => parseInt(r.trim()));
            currentExercise.reps = repsList[0] || 0;
            continue;
          }
          
          // Handle formats like "2 sets x 10–15 reps"
          const setsRepsMatch = setsInfo.match(/^(\d+)\s*sets?\s*x\s*([\d–]+)\s*reps?$/);
          if (setsRepsMatch) {
            currentExercise.sets = parseInt(setsRepsMatch[1]);
            // Take the first rep count as default
            const repsRange = setsRepsMatch[2].split('–');
            currentExercise.reps = parseInt(repsRange[0]) || 0;
            continue;
          }
          
          // Handle formats like "2 x 45 sec" - time-based exercises
          const timeMatch = setsInfo.match(/^(\d+)\s*x\s*(\d+)\s*sec$/);
          if (timeMatch) {
            currentExercise.sets = parseInt(timeMatch[1]);
            currentExercise.reps = 0; // No reps for time-based exercises
            currentExercise.isTimeBased = true;
            currentExercise.duration = parseInt(timeMatch[2]);
            continue;
          }
        }
        
        // Extract weight
        if (block.startsWith('Weight suggestion:')) {
          const weightInfo = block.substring(17).trim();
          const weightMatch = weightInfo.match(/^(\d+(?:\.\d+)?)\s*(?:–\s*\d+(?:\.\d+)?)?\s*(?:–\s*\d+(?:\.\d+)?)?\s*(kg|lbs)$/);
          if (weightMatch) {
            currentExercise.weight = parseFloat(weightMatch[1]);
            currentExercise.unit = weightMatch[2];
            continue;
          }
        }
        
        // Extract rest
        if (block.startsWith('Rest:')) {
          currentExercise.rest = block.substring(5).trim();
          continue;
        }
        
        // Handle "Max reps" format
        if (block.includes('Max reps')) {
          const maxRepsMatch = block.match(/Max reps x (\d+) sets/);
          if (maxRepsMatch) {
            currentExercise.sets = parseInt(maxRepsMatch[1]);
            currentExercise.reps = 0; // We don't know the exact reps for max reps
            continue;
          }
        }
      }
    }
    
    // Add the last exercise if there is one
    if (currentExercise) {
      exercises.push(currentExercise);
    }
    
    return exercises;
  }
}

// Helper function to extract exercise details from a name
function extractExerciseDetailsFromName(exercise: ParsedExercise): void {
  const name = exercise.name;
  
  // Pattern 1: "Bench press 3x10 60kg" or "Squats 3x12 100kg"
  const pattern1 = /^(.+?)\s+(\d+)x(\d+)(?:\s+(\d+)(kg|lbs))?$/i;
  
  // Pattern 2: "Bench press 3 sets of 10 reps at 60kg"
  const pattern2 = /^(.+?)\s+(\d+)\s+sets?\s+of\s+(\d+)\s+reps?(?:\s+at\s+(\d+)(kg|lbs))?$/i;
  
  // Pattern 3: "Bench press 3 sets 10 reps 60kg"
  const pattern3 = /^(.+?)\s+(\d+)\s+sets?\s+(\d+)\s+reps?(?:\s+(\d+)(kg|lbs))?$/i;
  
  // Pattern 4: "Bench press 60kg 3x10"
  const pattern4 = /^(.+?)\s+(\d+)(kg|lbs)\s+(\d+)x(\d+)$/i;
  
  // Pattern 5: "Bench press 60kg"
  const pattern5 = /^(.+?)\s+(\d+)(kg|lbs)$/i;
  
  // Pattern 6: "Bench press 3x10"
  const pattern6 = /^(.+?)\s+(\d+)x(\d+)$/i;
  
  // Pattern 7: "Plank 3x45sec" or "Push-ups 3x30sec"
  const pattern7 = /^(.+?)\s+(\d+)x(\d+)(sec|s)$/i;
  
  // Try each pattern in order
  let match = name.match(pattern1);
  let patternUsed = 1;
  
  if (!match) {
    match = name.match(pattern2);
    patternUsed = 2;
  }
  
  if (!match) {
    match = name.match(pattern3);
    patternUsed = 3;
  }
  
  if (!match) {
    match = name.match(pattern4);
    patternUsed = 4;
  }
  
  if (!match) {
    match = name.match(pattern5);
    patternUsed = 5;
  }
  
  if (!match) {
    match = name.match(pattern6);
    patternUsed = 6;
  }
  
  if (!match) {
    match = name.match(pattern7);
    patternUsed = 7;
  }
  
  if (match) {
    let name, sets, reps, weight, unit;
    
    if (patternUsed === 4) {
      // Pattern 4: "Bench press 60kg 3x10"
      [, name, weight, unit, sets, reps] = match;
    } else if (patternUsed === 5) {
      // Pattern 5: "Bench press 60kg"
      [, name, weight, unit] = match;
      sets = "0";
      reps = "0";
    } else if (patternUsed === 6) {
      // Pattern 6: "Bench press 3x10"
      [, name, sets, reps] = match;
      weight = undefined;
      unit = undefined;
    } else if (patternUsed === 7) {
      // Pattern 7: "Plank 3x45sec"
      [, name, sets, reps, unit] = match;
      exercise.isTimeBased = true;
      exercise.duration = parseInt(reps);
      reps = "0"; // Set reps to 0 for time-based exercises
    } else {
      // Patterns 1-3: "Bench press 3x10 60kg" or similar
      [, name, sets, reps, weight, unit] = match;
    }
    
    exercise.name = name.trim();
    exercise.sets = parseInt(sets);
    exercise.reps = parseInt(reps);
    exercise.weight = weight ? parseFloat(weight) : undefined;
    exercise.unit = unit || undefined;
  }
  
  // Check if this is a time-based exercise by name
  if (!exercise.isTimeBased) {
    const timeBasedKeywords = [
      'plank', 'push-up', 'pushup', 'wall sit', 'wall sit', 'wall squat',
      'bridge', 'glute bridge', 'superman', 'bird dog', 'dead bug',
      'hollow hold', 'side plank', 'mountain climber', 'burpee'
    ];
    
    const exerciseNameLower = exercise.name.toLowerCase();
    for (const keyword of timeBasedKeywords) {
      if (exerciseNameLower.includes(keyword)) {
        exercise.isTimeBased = true;
        // Default to 30 seconds if no duration is specified
        exercise.duration = exercise.duration || 30;
        break;
      }
    }
  }
} 