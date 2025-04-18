import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, SkipForward, RotateCcw, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface ExerciseTimerProps {
  exerciseName: string;
  duration: number; // in seconds
  sets: number;
  onComplete?: () => void;
}

export function ExerciseTimer({ exerciseName, duration, sets, onComplete }: ExerciseTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);
  const [currentSet, setCurrentSet] = useState(1);
  const [isRest, setIsRest] = useState(false);
  const [restTimeLeft, setRestTimeLeft] = useState(30); // 30 seconds rest between sets
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Format time in MM:SS format
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const progress = isRest 
    ? ((restTimeLeft / 30) * 100) 
    : ((timeLeft / duration) * 100);

  // Start the timer
  const startTimer = () => {
    if (timerRef.current) return;
    
    setIsRunning(true);
    timerRef.current = setInterval(() => {
      if (isRest) {
        setRestTimeLeft(prev => {
          if (prev <= 1) {
            // Rest period complete, start next set
            setIsRest(false);
            setTimeLeft(duration);
            setCurrentSet(prevSet => prevSet + 1);
            toast.success(`Set ${currentSet} complete! Starting set ${currentSet + 1}`);
            return 30; // Reset rest time
          }
          return prev - 1;
        });
      } else {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Exercise period complete, start rest
            if (currentSet < sets) {
              setIsRest(true);
              toast.success(`Set ${currentSet} complete! Rest time.`);
              return duration; // Reset exercise time
            } else {
              // All sets complete
              clearInterval(timerRef.current!);
              timerRef.current = null;
              setIsRunning(false);
              toast.success('Workout complete!');
              if (onComplete) onComplete();
              return 0;
            }
          }
          return prev - 1;
        });
      }
    }, 1000);
  };

  // Pause the timer
  const pauseTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      setIsRunning(false);
    }
  };

  // Skip to next set
  const skipSet = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (isRest) {
      setIsRest(false);
      setTimeLeft(duration);
      setCurrentSet(prevSet => prevSet + 1);
      toast.success(`Skipping rest. Starting set ${currentSet + 1}`);
    } else {
      if (currentSet < sets) {
        setIsRest(true);
        setRestTimeLeft(30);
        toast.success(`Skipping to rest after set ${currentSet}`);
      } else {
        // All sets complete
        setIsRunning(false);
        toast.success('Workout complete!');
        if (onComplete) onComplete();
      }
    }
  };

  // Reset the timer
  const resetTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setIsRunning(false);
    setTimeLeft(duration);
    setCurrentSet(1);
    setIsRest(false);
    setRestTimeLeft(30);
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return (
    <Card className="w-full border-2 border-primary/10 shadow-md">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold flex items-center">
            <Clock className="h-5 w-5 mr-2 text-primary" />
            {exerciseName}
          </CardTitle>
          <Badge variant={isRest ? "secondary" : "default"} className="font-mono">
            {isRest ? "REST" : `Set ${currentSet} of ${sets}`}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 pb-4">
        <div className="flex flex-col items-center space-y-6">
          <div className="text-5xl font-bold font-mono">
            {isRest ? formatTime(restTimeLeft) : formatTime(timeLeft)}
          </div>
          
          <Progress value={progress} className="w-full h-2" />
          
          <div className="flex gap-2 mt-4">
            {!isRunning ? (
              <Button 
                onClick={startTimer} 
                size="lg"
                className="flex-1"
              >
                <Play className="h-4 w-4 mr-2" />
                Start
              </Button>
            ) : (
              <Button 
                onClick={pauseTimer} 
                variant="outline"
                size="lg"
                className="flex-1"
              >
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
            )}
            
            <Button 
              onClick={skipSet} 
              variant="outline"
              size="lg"
              className="flex-1"
            >
              <SkipForward className="h-4 w-4 mr-2" />
              Skip
            </Button>
            
            <Button 
              onClick={resetTimer} 
              variant="outline"
              size="lg"
              className="flex-1"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 