import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Exercise, Workout } from '@/types/workout';
import { extractWorkoutFromImage } from '@/lib/gemini';
import { Plus, Trash2, Upload, Loader2, CheckCircle2, Check, Copy, X, Dumbbell, Quote } from 'lucide-react';
import { toast } from 'sonner';
import { MotivationalMessage } from '@/components/MotivationalMessage';

// Add motivational quotes array
const motivationalQuotes = [
  "The only bad workout is the one that didn't happen.",
  "Your body can stand almost anything. It's your mind you have to convince.",
  "The hard days are what make you stronger.",
  "Success starts with self-discipline.",
  "Your health is an investment, not an expense.",
  "The only person you are destined to become is the person you decide to be.",
  "Don't wish for it. Work for it.",
  "The difference between try and triumph is just a little umph!",
  "Your body can do it. It's time to convince your mind.",
  "The only limit is the one you set yourself.",
  "Pain is temporary. Quitting lasts forever.",
  "Your future self is watching you right now through memories.",
  "The only person you should try to be better than is the person you were yesterday.",
  "Fall in love with the process of becoming the very best version of yourself.",
  "The only bad workout is the one that didn't happen."
];

interface WorkoutFormProps {
  onSubmit: (workout: Omit<Workout, 'id'>) => void;
}

export function WorkoutForm({ onSubmit }: WorkoutFormProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [savedSets, setSavedSets] = useState<{[exerciseIndex: number]: {[setIndex: number]: boolean}}>({});
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);
  const [finishedExercises, setFinishedExercises] = useState<{[exerciseIndex: number]: boolean}>({});
  const [showSummary, setShowSummary] = useState(false);
  const [workoutSummary, setWorkoutSummary] = useState<{
    totalExercises: number;
    totalSets: number;
    totalWeight: number;
    exercises: Exercise[];
    motivationalQuote: string;
  } | null>(null);
  const [currentMotivationalQuote, setCurrentMotivationalQuote] = useState<string | null>(null);
  const [showMotivationalQuote, setShowMotivationalQuote] = useState(false);

  // Auto-save when exercises, date, or notes change
  useEffect(() => {
    // Clear any existing timer
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }

    // Set a new timer to auto-save after 1 second of inactivity
    const timer = setTimeout(() => {
      if (exercises.length > 0) {
        handleAutoSave();
      }
    }, 1000);

    setAutoSaveTimer(timer);

    // Clean up the timer when the component unmounts
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [exercises, date, notes]);

  const handleAutoSave = () => {
    // Only save if there's at least one exercise
    if (exercises.length > 0) {
      onSubmit({
        date,
        exercises,
        completed: false,
        notes
      });
      
      // Only show success message if there's at least one exercise with a name
      if (exercises.some(ex => ex.name.trim() !== '')) {
        toast.success('Workout auto-saved!', {
          duration: 2000,
          position: 'bottom-right',
        });
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast.success('Workout summary copied to clipboard!', {
          duration: 3000,
          position: 'bottom-right',
        });
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
        toast.error('Failed to copy to clipboard', {
          duration: 3000,
          position: 'bottom-right',
        });
      });
  };

  const formatWorkoutSummary = (exercises: Exercise[], date: string, notes: string) => {
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    let summary = `📅 Workout Summary - ${formattedDate}\n\n`;
    
    exercises.forEach((exercise, index) => {
      summary += `🏋️‍♂️ ${exercise.name}\n`;
      
      exercise.sets.forEach((set, setIndex) => {
        summary += `  Set ${setIndex + 1}: ${set.weight}kg × ${set.reps} reps\n`;
      });
      
      summary += '\n';
    });
    
    if (notes.trim()) {
      summary += `📝 Notes: ${notes}\n`;
    }
    
    summary += `\n💪 Total Exercises: ${exercises.length}`;
    summary += `\n🔄 Total Sets: ${exercises.reduce((acc, ex) => acc + ex.sets.length, 0)}`;
    summary += `\n⚖️ Total Weight: ${exercises.reduce((acc, ex) => 
      acc + ex.sets.reduce((setAcc, set) => setAcc + (set.weight || 0), 0), 0
    )}kg`;
    
    return summary;
  };

  const addExercise = () => {
    setExercises([
      ...exercises,
      {
        name: '',
        sets: [{ reps: 12, weight: 10, completed: false }]
      }
    ]);
  };

  const updateExercise = (index: number, field: keyof Exercise, value: any) => {
    const updatedExercises = [...exercises];
    updatedExercises[index] = {
      ...updatedExercises[index],
      [field]: value
    };
    setExercises(updatedExercises);
  };

  const addSet = (exerciseIndex: number) => {
    const updatedExercises = [...exercises];
    const lastSetIndex = updatedExercises[exerciseIndex].sets.length - 1;
    const lastSet = updatedExercises[exerciseIndex].sets[lastSetIndex];
    
    // Create a new set with the same values as the last set but not completed
    const newSet = {
      reps: lastSet.reps,
      weight: lastSet.weight,
      completed: false
    };
    
    // Add the new set
    updatedExercises[exerciseIndex].sets.push(newSet);
    setExercises(updatedExercises);
    
    // Show success message
    toast.success(`Set copied from "${exercises[exerciseIndex].name || 'Exercise'}"`, {
      duration: 2000,
      position: 'bottom-right',
    });
  };

  const updateSet = (
    exerciseIndex: number,
    setIndex: number,
    field: 'reps' | 'weight' | 'completed',
    value: number | boolean
  ) => {
    const updatedExercises = [...exercises];
    updatedExercises[exerciseIndex].sets[setIndex] = {
      ...updatedExercises[exerciseIndex].sets[setIndex],
      [field]: value
    };
    setExercises(updatedExercises);
    
    // If the set is marked as completed, save it
    if (field === 'completed' && value === true) {
      setSavedSets(prev => ({
        ...prev,
        [exerciseIndex]: {
          ...(prev[exerciseIndex] || {}),
          [setIndex]: true
        }
      }));
      
      // Remove toast message to avoid layering with motivational quote
    }
  };

  const copySet = (exerciseIndex: number, setIndex: number) => {
    const updatedExercises = [...exercises];
    const setToCopy = updatedExercises[exerciseIndex].sets[setIndex];
    
    // Create a new set with the same values but not completed
    const newSet = {
      reps: setToCopy.reps,
      weight: setToCopy.weight,
      completed: false
    };
    
    // Add the new set after the current set
    updatedExercises[exerciseIndex].sets.splice(setIndex + 1, 0, newSet);
    setExercises(updatedExercises);
    
    // Show success message
    toast.success(`Set ${setIndex + 1} of "${exercises[exerciseIndex].name}" copied!`, {
      duration: 2000,
      position: 'bottom-right',
    });
  };

  const deleteSet = (exerciseIndex: number, setIndex: number) => {
    const updatedExercises = [...exercises];
    
    // Remove the set at the specified index
    updatedExercises[exerciseIndex].sets.splice(setIndex, 1);
    
    // If this was the last set, remove the exercise
    if (updatedExercises[exerciseIndex].sets.length === 0) {
      updatedExercises.splice(exerciseIndex, 1);
    }
    
    setExercises(updatedExercises);
    
    // Show success message
    toast.success(`Set ${setIndex + 1} deleted!`, {
      duration: 2000,
      position: 'bottom-right',
    });
  };

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('Image file is too large. Please use an image under 5MB.', {
        duration: 3000,
        position: 'bottom-right',
      });
      return;
    }

    // Check file type
    if (!file.type.match(/^image\/(jpeg|png|jpg|webp)$/)) {
      toast.error('Please upload a valid image file (JPEG, PNG, or WebP).', {
        duration: 3000,
        position: 'bottom-right',
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const base64 = e.target?.result as string;
          console.log('Image loaded, starting OCR processing...');
          
          toast.info('Processing image with OCR... This may take a few seconds.', {
            duration: 3000,
            position: 'bottom-right',
          });
          
          const extractedExercises = await extractWorkoutFromImage(base64);
          
          if (extractedExercises.length > 0) {
            console.log('Exercises extracted:', extractedExercises);
            setExercises(extractedExercises);
            setError(null);
            toast.success(`Successfully detected ${extractedExercises.length} exercises from your image!`, {
              duration: 3000,
              position: 'bottom-right',
            });
          } else {
            toast.error('No exercises could be detected in the image. Please try again with a clearer image or add exercises manually.', {
              duration: 3000,
              position: 'bottom-right',
            });
          }
        } catch (error) {
          console.error('Error processing image:', error);
          toast.error('Error processing image. Please try again or add exercises manually.', {
            duration: 3000,
            position: 'bottom-right',
          });
        } finally {
          setIsLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error reading file:', error);
      toast.error('Error reading file. Please try again.', {
        duration: 3000,
        position: 'bottom-right',
      });
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-6">
      {showMotivationalQuote && currentMotivationalQuote && (
        <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border border-green-200 dark:border-green-800 shadow-sm">
          <div className="flex items-start gap-3">
            <Quote className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <p className="italic text-gray-700 dark:text-gray-300">"{currentMotivationalQuote}"</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-4">
        <Card className="p-6 bg-gradient-to-br from-gray-50 to-green-50 dark:from-gray-800 dark:to-gray-900 border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Add Workout</h2>
          
          <div>
            <label htmlFor="date" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Date
            </label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="border-gray-200 dark:border-gray-700 focus:border-green-500 focus:ring-green-500 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>
          
          <div className="mt-6">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Upload Workout Image
            </label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex items-center gap-2 border-gray-200 dark:border-gray-700 hover:bg-green-50 dark:hover:bg-gray-700"
                onClick={() => document.getElementById('image-upload')?.click()}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Upload Image
                  </>
                )}
              </Button>
              <input
                id="image-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleImageUpload}
                disabled={isLoading}
              />
            </div>
          </div>
        </Card>
        
        {error && (
          <div className={`p-3 rounded-md ${error.includes('Processing') ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'}`}>
            {error}
          </div>
        )}
        
        {successMessage && (
          <div className="p-3 rounded-md bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            {successMessage}
          </div>
        )}
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Exercises</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addExercise}
              disabled={isLoading}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Exercise
            </Button>
          </div>
          
          {exercises.length === 0 && !isLoading && (
            <div className="text-center p-6 border border-dashed rounded-lg">
              <p className="text-muted-foreground">No exercises added yet. Upload an image or add exercises manually.</p>
            </div>
          )}
          
          {exercises.map((exercise, exerciseIndex) => (
            <Card key={exerciseIndex} className="p-4 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Input
                  placeholder="Exercise name"
                  value={exercise.name}
                  onChange={(e) =>
                    updateExercise(exerciseIndex, 'name', e.target.value)
                  }
                  required
                  className="font-medium"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => removeExercise(exerciseIndex)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                {/* Header */}
                <div className="grid grid-cols-6 gap-2 text-sm font-medium text-muted-foreground mb-2">
                  <div className="text-center">SET</div>
                  <div className="text-center">KG</div>
                  <div className="text-center flex items-center justify-center">
                    <Dumbbell className="h-4 w-4" />
                  </div>
                  <div className="text-center">REPS</div>
                  <div></div>
                </div>
                
                {/* Sets */}
                {exercise.sets.map((set, setIndex) => (
                  <div key={setIndex} className="grid grid-cols-6 gap-2 items-center mb-2">
                    <div className="font-medium text-center">{setIndex + 1}</div>
                    <div className="text-muted-foreground text-center text-sm">
                      {set.weight}kg × {set.reps}
                    </div>
                    <Input
                      type="text"
                      value={set.weight || ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? '' : Number(e.target.value);
                        updateSet(exerciseIndex, setIndex, 'weight', value);
                      }}
                      className="w-full text-center"
                      required
                      min="0"
                      step="0.5"
                      placeholder="KG"
                    />
                    <Input
                      type="text"
                      value={set.reps || ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? '' : Number(e.target.value);
                        updateSet(exerciseIndex, setIndex, 'reps', value);
                      }}
                      className="w-full text-center"
                      required
                      min="0"
                      placeholder="REPS"
                    />
                    <div className="text-center">
                      {savedSets[exerciseIndex]?.[setIndex] ? (
                        <span className="text-green-500 text-sm font-medium">Saved</span>
                      ) : null}
                    </div>
                    {setIndex > 0 && (
                      <div className="flex justify-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 hover:bg-red-50"
                          onClick={() => deleteSet(exerciseIndex, setIndex)}
                          aria-label="Delete set"
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-2 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addSet(exerciseIndex)}
                  className="flex-1 text-sm bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 border-0"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Set
                </Button>
                <Button
                  type="button"
                  variant="default"
                  onClick={() => {
                    // Mark all sets as completed
                    const updatedExercises = [...exercises];
                    updatedExercises[exerciseIndex].sets.forEach((_, setIndex) => {
                      updateSet(exerciseIndex, setIndex, 'completed', true);
                    });
                    setExercises(updatedExercises);
                    
                    // Mark this exercise as finished
                    setFinishedExercises(prev => ({
                      ...prev,
                      [exerciseIndex]: true
                    }));
                    
                    // Show motivational message on page instead of toast
                    const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
                    setCurrentMotivationalQuote(randomQuote);
                    setShowMotivationalQuote(true);
                    
                    // Auto-hide the quote after 5 seconds
                    setTimeout(() => {
                      setShowMotivationalQuote(false);
                    }, 5000);
                  }}
                  className={`flex-1 text-sm ${
                    finishedExercises[exerciseIndex] 
                      ? "bg-green-500 hover:bg-green-600" 
                      : "bg-blue-500 hover:bg-blue-600"
                  }`}
                >
                  <Check className="h-4 w-4 mr-1" />
                  {finishedExercises[exerciseIndex] ? "Completed!" : "Finish"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
      
      <div className="flex justify-center mt-6">
        {exercises.length > 0 && (
          <Button
            type="button"
            variant="default"
            onClick={() => {
              // Mark all exercises and their sets as completed
              const updatedExercises = exercises.map((exercise, exerciseIndex) => ({
                ...exercise,
                sets: exercise.sets.map((_, setIndex) => {
                  updateSet(exerciseIndex, setIndex, 'completed', true);
                  return { ...exercise.sets[setIndex], completed: true };
                })
              }));
              setExercises(updatedExercises);
              
              // Mark all exercises as finished
              const allFinished = exercises.reduce((acc, _, index) => ({
                ...acc,
                [index]: true
              }), {});
              setFinishedExercises(allFinished);
              
              // Calculate workout summary
              const totalExercises = exercises.length;
              const totalSets = exercises.reduce((acc, exercise) => acc + exercise.sets.length, 0);
              const totalWeight = exercises.reduce((acc, exercise) => 
                acc + exercise.sets.reduce((setAcc, set) => setAcc + (set.weight || 0), 0), 0
              );
              
              // Get a random motivational quote
              const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
              
              // Save the completed workout
              onSubmit({
                date,
                exercises: updatedExercises,
                completed: true,
                notes
              });
              
              // Set the workout summary and show it
              setWorkoutSummary({
                totalExercises,
                totalSets,
                totalWeight,
                exercises: updatedExercises,
                motivationalQuote: randomQuote
              });
              setShowSummary(true);
              
              // Copy workout summary to clipboard
              const summaryText = formatWorkoutSummary(updatedExercises, date, notes);
              copyToClipboard(summaryText);
            }}
            className="bg-green-500 hover:bg-green-600 text-white px-8 py-2 text-lg"
          >
            <Check className="h-5 w-5 mr-2" />
            Finished All Exercises
          </Button>
        )}
      </div>

      {showSummary && workoutSummary && (
        <Card className="mt-6 p-6 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-green-200 dark:border-green-800">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-green-700 dark:text-green-400">Workout Summary 🎉</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSummary(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <p className="text-sm text-muted-foreground">Total Exercises</p>
                <p className="text-2xl font-bold">{workoutSummary.totalExercises}</p>
              </div>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <p className="text-sm text-muted-foreground">Total Sets</p>
                <p className="text-2xl font-bold">{workoutSummary.totalSets}</p>
              </div>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <p className="text-sm text-muted-foreground">Total Weight</p>
                <p className="text-2xl font-bold">{workoutSummary.totalWeight}kg</p>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="font-semibold mb-2">Exercise Details</h4>
              <div className="space-y-2">
                {workoutSummary.exercises.map((exercise, index) => (
                  <div key={index} className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <p className="font-medium">{exercise.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {exercise.sets.length} sets • {exercise.sets.reduce((acc, set) => acc + (set.weight || 0), 0)}kg total
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">Great job! Keep up the amazing work! 💪</p>
            </div>
          </div>
        </Card>
      )}
    </form>
  );
}