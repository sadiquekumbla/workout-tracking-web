import { useState, useEffect } from 'react';
import { parseWorkoutText, ParsedExercise } from '@/lib/workout-parser';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, CheckCircle2, AlertCircle, Copy, Plus, Trash2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { ExerciseTimer } from '@/components/exercise-timer';

interface WorkoutTextInputProps {
  onAddExercises?: (exercises: ParsedExercise[]) => void;
}

export function WorkoutTextInput({ onAddExercises }: WorkoutTextInputProps) {
  const [text, setText] = useState('');
  const [parsedExercises, setParsedExercises] = useState<ParsedExercise[]>([]);
  const [activeTab, setActiveTab] = useState('input');
  const [showExamples, setShowExamples] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTimer, setActiveTimer] = useState<ParsedExercise | null>(null);

  // Example templates with detailed workout information
  const examples = [
    `Chest Workouts
---
Flat Bench Press (Barbell or Dumbbell)
Focus: Overall chest mass
Sets: 3 (12 – 12 – 10 reps)
Rest: 90 sec
---
Incline Dumbbell Press
Focus: Upper chest
Sets: 3 (12 – 12 – 10 reps)
Rest: 60–90 sec`,
    `Triceps Workouts
---
Cable Rope Pushdown
Weight suggestion: 25–35–40kg
Sets: 3 (12 – 12 – 10 reps)
Rest: 60–90 sec
---
Overhead Dumbbell Extension
Weight suggestion: 12.5 – 15 – 20kg
Sets: 3 (12 – 12 – 10 reps)
Rest: 60–90 sec`,
    `Core Workouts
---
Plank Hold
Sets: 2 x 45 sec
Rest: 60 sec between holds
---
Push-Ups (Bodyweight Burnout)
Max reps x 2 sets
Rest: 60 sec`,
    `Simple Format Examples
---
Bench press 3x10 60kg
Squats 3 sets of 12 reps at 100kg
Deadlift 60kg 3x8
Pull-ups 3x10
Dumbbell rows 15kg 3x12
Plank 3x45sec
Push-ups 3x30sec`
  ];

  const handleTextChange = (value: string) => {
    setText(value);
    setErrorMessage(null);
    
    if (value.trim() === '') {
      setParsedExercises([]);
      return;
    }
    
    try {
      const parsed = parseWorkoutText(value);
      setParsedExercises(parsed);
      
      // Check if any exercises couldn't be parsed properly
      const unparsedExercises = parsed.filter(ex => ex.sets === 0 && ex.reps === 0 && !ex.isTimeBased);
      if (unparsedExercises.length > 0) {
        // Only show the exercise names, not the full error message
        const unparsedNames = unparsedExercises.map(ex => ex.name).join(', ');
        setErrorMessage(`Couldn't fully parse: ${unparsedNames}`);
      }
    } catch (error) {
      console.error('Error parsing workout text:', error);
      setErrorMessage('An error occurred while parsing the workout text. Please check your input format.');
      setParsedExercises([]);
    }
  };

  const handleAddExercises = () => {
    if (onAddExercises && parsedExercises.length > 0) {
      // Filter out exercises that couldn't be parsed
      const validExercises = parsedExercises.filter(ex => ex.sets > 0 || ex.reps > 0 || ex.isTimeBased);
      
      if (validExercises.length > 0) {
        onAddExercises(validExercises);
        setText('');
        setParsedExercises([]);
        setActiveTab('input');
        toast.success(`Added ${validExercises.length} exercises to your workout!`);
      }
    }
  };

  const handleUseExample = (example: string) => {
    setText(example);
    handleTextChange(example);
    setShowExamples(false);
  };

  const handleCopyToClipboard = () => {
    const textToCopy = examples.join('\n\n');
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        toast.success('Examples copied to clipboard!');
      })
      .catch(() => {
        toast.error('Failed to copy to clipboard');
      });
  };

  // Format duration in seconds to a readable format (e.g., 45 sec, 1 min 30 sec)
  const formatDuration = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds} sec`;
    }
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (remainingSeconds === 0) {
      return `${minutes} min`;
    }
    
    return `${minutes} min ${remainingSeconds} sec`;
  };

  // Start timer for a time-based exercise
  const startTimer = (exercise: ParsedExercise) => {
    // For plank and pushup exercises, set a default duration if not specified
    const timerExercise = { ...exercise };
    
    if (!timerExercise.isTimeBased && 
        (timerExercise.name.toLowerCase().includes('plank') || 
         timerExercise.name.toLowerCase().includes('push-up') || 
         timerExercise.name.toLowerCase().includes('pushup'))) {
      timerExercise.isTimeBased = true;
      timerExercise.duration = timerExercise.duration || 30; // Default to 30 seconds if not specified
    }
    
    setActiveTimer(timerExercise);
    setActiveTab('timer');
  };

  // Handle timer completion
  const handleTimerComplete = () => {
    setActiveTimer(null);
    setActiveTab('input');
    toast.success('Timer completed!');
  };

  return (
    <Card className="w-full border-2 border-primary/10 shadow-md">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold">Quick Add Exercises</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowExamples(!showExamples)}
            className="text-xs"
          >
            {showExamples ? 'Hide Examples' : 'Show Examples'}
          </Button>
        </div>
        <CardDescription>
          Enter exercises with detailed information and they'll be automatically parsed
        </CardDescription>
      </CardHeader>
      
      {showExamples && (
        <div className="px-6 py-2 bg-muted/30 border-b">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium">Example formats:</h4>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleCopyToClipboard}
              className="h-6 text-xs"
            >
              <Copy className="h-3 w-3 mr-1" />
              Copy All
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {examples.map((example, index) => (
              <div 
                key={index} 
                className="text-xs p-2 bg-background rounded border cursor-pointer hover:bg-primary/5 transition-colors whitespace-pre-line"
                onClick={() => handleUseExample(example)}
              >
                {example}
              </div>
            ))}
          </div>
        </div>
      )}
      
      <CardContent className="pt-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="input">Input</TabsTrigger>
            <TabsTrigger value="preview" disabled={parsedExercises.length === 0}>
              Preview ({parsedExercises.length})
            </TabsTrigger>
            <TabsTrigger value="timer" disabled={!activeTimer}>
              Timer
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="input" className="space-y-4">
            <Textarea
              placeholder="Enter exercises with detailed information (e.g., 'Flat Bench Press\nFocus: Overall chest mass\nSets: 3 (12 – 12 – 10 reps)\nRest: 90 sec')"
              value={text}
              onChange={(e) => handleTextChange(e.target.value)}
              className="min-h-[120px] font-mono text-sm"
            />
            
            {errorMessage && (
              <Alert variant="destructive" className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Parsing Error</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
            
            {parsedExercises.length > 0 && (
              <div className="flex justify-end">
                <Button 
                  onClick={() => setActiveTab('preview')}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                >
                  View Preview
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="preview" className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Parsed Exercises:</h3>
                <Badge variant="outline" className="font-mono">
                  {parsedExercises.length} exercises
                </Badge>
              </div>
              
              <div className="border rounded-md divide-y">
                {parsedExercises.map((exercise, index) => (
                  <div key={index} className="p-3 flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium">
                        {exercise.serialNumber && (
                          <span className="mr-2 text-primary">{exercise.serialNumber}.</span>
                        )}
                        {exercise.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {exercise.isTimeBased ? (
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {exercise.sets}x{formatDuration(exercise.duration || 30)}
                          </div>
                        ) : (
                          <>
                            {exercise.name.toLowerCase().includes('plank') || exercise.name.toLowerCase().includes('push-up') || exercise.name.toLowerCase().includes('pushup') ? (
                              <div className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {exercise.sets}x{formatDuration(exercise.duration || 30)}
                              </div>
                            ) : (
                              <>
                                {exercise.sets}x{exercise.reps}
                                {exercise.weight && ` • ${exercise.weight}${exercise.unit}`}
                              </>
                            )}
                          </>
                        )}
                      </div>
                      {exercise.focus && (
                        <div className="text-xs text-muted-foreground mt-1">
                          <span className="font-medium">Focus:</span> {exercise.focus}
                        </div>
                      )}
                      {exercise.rest && (
                        <div className="text-xs text-muted-foreground">
                          <span className="font-medium">Rest:</span> {exercise.rest}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      {(exercise.isTimeBased || 
                        exercise.name.toLowerCase().includes('plank') || 
                        exercise.name.toLowerCase().includes('push-up') || 
                        exercise.name.toLowerCase().includes('pushup')) && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => startTimer(exercise)}
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          Start Timer
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          const newExercises = [...parsedExercises];
                          newExercises.splice(index, 1);
                          setParsedExercises(newExercises);
                          if (newExercises.length === 0) {
                            setActiveTab('input');
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button 
                  onClick={handleAddExercises} 
                  className="flex-1"
                  disabled={parsedExercises.length === 0}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Workout
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab('input')}
                >
                  Edit
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="timer" className="space-y-4">
            {activeTimer && (
              <ExerciseTimer 
                exerciseName={activeTimer.name}
                duration={activeTimer.duration || 30}
                sets={activeTimer.sets}
                onComplete={handleTimerComplete}
              />
            )}
            <div className="flex justify-end mt-4">
              <Button 
                variant="outline" 
                onClick={() => setActiveTab('preview')}
              >
                Back to Preview
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 