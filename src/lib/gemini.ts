import { Exercise } from '@/types/workout';
import { createWorker } from 'tesseract.js';

export async function extractWorkoutFromImage(imageData: string): Promise<Exercise[]> {
  try {
    console.log('Using Tesseract.js for OCR processing');
    
    // Check if the image data is valid
    if (!imageData || imageData.length < 100) {
      console.log('Invalid image data, returning empty array');
      return [];
    }
    
    // Create a Tesseract worker
    const worker = await createWorker();
    
    try {
      // Perform OCR on the image
      console.log('Starting OCR processing...');
      const { data } = await worker.recognize(imageData);
      console.log('OCR processing completed');
      
      // Get the text from the OCR result
      const text = data.text;
      console.log('OCR text result:', text);
      
      // If no text was detected, return empty array
      if (!text || text.trim() === '') {
        console.log('No text detected in image');
        return [];
      }
      
      // Parse the detected text to extract workout information
      const exercises = parseWorkoutText(text);
      console.log('Extracted exercises:', exercises);
      
      return exercises;
    } finally {
      // Terminate the worker to free up resources
      await worker.terminate();
    }
  } catch (error) {
    console.error('Error extracting workout from image:', error);
    return [];
  }
}

function parseWorkoutText(text: string): Exercise[] {
  // This function parses the OCR text to extract workout information
  
  const exercises: Exercise[] = [];
  
  // Clean up the text - replace multiple spaces with single space
  const cleanedText = text.replace(/\s+/g, ' ').trim();
  
  // Split by newlines and clean each line
  const lines = text.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
  
  console.log('Parsing OCR text lines:', lines);
  
  // First, try to detect a workout title
  let workoutTitle = '';
  for (const line of lines) {
    // Look for lines that might be a workout title (usually at the top, capitalized, not too long)
    if (line.length > 3 && line.length < 50 && 
        (line.toUpperCase() === line || 
         line.split(' ').every(word => word.charAt(0) === word.charAt(0).toUpperCase()))) {
      workoutTitle = line;
      console.log('Detected workout title:', workoutTitle);
      break;
    }
  }
  
  // Try to find exercise blocks in the text
  // Look for patterns like "1. Exercise Name" or "Exercise Name: 3 sets of 10 reps"
  
  // First, try to find numbered exercises (e.g., "1. Bench Press")
  const numberedExerciseRegex = /(\d+)[\.\)]\s*([A-Za-z\s]+)/g;
  let match;
  let foundNumberedExercises = false;
  
  while ((match = numberedExerciseRegex.exec(cleanedText)) !== null) {
    foundNumberedExercises = true;
    const serialNumber = match[1];
    const exerciseName = match[2].trim();
    
    console.log('Found numbered exercise:', { serialNumber, exerciseName });
    
    // Create default sets for this exercise
    exercises.push({
      name: exerciseName,
      sets: [
        { reps: 0, weight: 0, completed: false }
      ]
    });
  }
  
  // If we found numbered exercises, return them
  if (foundNumberedExercises) {
    return exercises;
  }
  
  // Common exercise patterns to look for
  const exercisePatterns = [
    // Pattern 1: "Exercise Name: X sets of Y reps at Z weight"
    /([A-Za-z\s]+):\s*(\d+)\s*sets\s*of\s*(\d+)\s*reps\s*(?:at|@)?\s*(\d+)?\s*(?:kg|lbs|lb)?/i,
    
    // Pattern 2: "Exercise Name X sets of Y reps at Z weight"
    /([A-Za-z\s]+)\s*(\d+)\s*sets\s*of\s*(\d+)\s*reps\s*(?:at|@)?\s*(\d+)?\s*(?:kg|lbs|lb)?/i,
    
    // Pattern 3: "Exercise Name X x Y at Z weight"
    /([A-Za-z\s]+)\s*(\d+)\s*x\s*(\d+)\s*(?:at|@)?\s*(\d+)?\s*(?:kg|lbs|lb)?/i,
    
    // Pattern 4: "Exercise Name: X reps, Y sets, Z weight"
    /([A-Za-z\s]+):\s*(\d+)\s*reps,\s*(\d+)\s*sets,\s*(\d+)?\s*(?:kg|lbs|lb)?/i,
    
    // Pattern 5: "Exercise Name - X sets, Y reps, Z weight"
    /([A-Za-z\s]+)\s*-\s*(\d+)\s*sets,\s*(\d+)\s*reps,\s*(\d+)?\s*(?:kg|lbs|lb)?/i,
    
    // Pattern 6: "Exercise Name (X sets, Y reps, Z weight)"
    /([A-Za-z\s]+)\s*\(\s*(\d+)\s*sets,\s*(\d+)\s*reps,\s*(\d+)?\s*(?:kg|lbs|lb)?\s*\)/i,
  ];
  
  // Process each line
  for (const line of lines) {
    console.log('Processing line:', line);
    
    // Skip the workout title line
    if (line === workoutTitle) continue;
    
    for (const pattern of exercisePatterns) {
      const match = line.match(pattern);
      if (match) {
        console.log('Match found with pattern:', pattern);
        
        const exerciseName = match[1].trim();
        const numSets = parseInt(match[2], 10);
        const reps = parseInt(match[3], 10);
        const weight = match[4] ? parseInt(match[4], 10) : 0;
        
        console.log('Extracted exercise:', { exerciseName, numSets, reps, weight });
        
        // Create sets for this exercise
        const sets = Array(numSets).fill(null).map(() => ({
          reps,
          weight,
          completed: false
        }));
        
        exercises.push({
          name: exerciseName,
          sets: [
            { reps: 0, weight: 0, completed: false }
          ]
        });
        
        // Found a match, move to next line
        break;
      }
    }
  }
  
  // If no exercises were found with the patterns, try a more generic approach
  if (exercises.length === 0) {
    console.log('No exercises found with patterns, trying generic approach');
    
    // Look for lines that might be exercise names (excluding the workout title)
    const potentialExercises = lines.filter(line => 
      line !== workoutTitle &&
      line.length > 3 && 
      line.length < 30 && 
      !line.includes(':') && 
      !line.includes('sets') && 
      !line.includes('reps') &&
      !line.includes('weight') &&
      !line.includes('kg') &&
      !line.includes('lbs')
    );
    
    console.log('Potential exercise names:', potentialExercises);
    
    // Create exercises with default sets
    for (const exerciseName of potentialExercises) {
      exercises.push({
        name: exerciseName,
        sets: [
          { reps: 0, weight: 0, completed: false }
        ]
      });
    }
  }
  
  return exercises;
} 