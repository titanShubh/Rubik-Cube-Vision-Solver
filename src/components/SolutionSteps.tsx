
import { useState, useEffect } from "react";
import { Play, Pause, RotateCw, ChevronRight, CheckCircle, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SolutionStep {
  move: string;
  description: string;
}

interface SolutionStepsProps {
  steps: SolutionStep[];
}

const CUBE_FACES = {
  'R': { name: 'Right', color: 'bg-red-500', position: 'right' },
  'L': { name: 'Left', color: 'bg-orange-500', position: 'left' },
  'U': { name: 'Up', color: 'bg-yellow-500', position: 'top' },
  'D': { name: 'Down', color: 'bg-white', position: 'bottom' },
  'F': { name: 'Front', color: 'bg-blue-500', position: 'front' },
  'B': { name: 'Back', color: 'bg-green-500', position: 'back' }
};

export const SolutionSteps = ({ steps }: SolutionStepsProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isWaiting, setIsWaiting] = useState(false);

  // Auto-progression effect
  useEffect(() => {
    if (!isPlaying || currentStep >= steps.length) return;

    const timer = setTimeout(() => {
      if (isWaiting) {
        // After 2 second wait, move to next step
        setIsWaiting(false);
        if (currentStep < steps.length - 1) {
          const nextStep = currentStep + 1;
          setCurrentStep(nextStep);
          handleStepComplete(currentStep);
        } else {
          // Completed all steps
          handleStepComplete(currentStep);
          setIsPlaying(false);
        }
      } else {
        // Start 2 second wait
        setIsWaiting(true);
      }
    }, isWaiting ? 2000 : 1000); // 2 seconds wait, 1 second to show the move

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, isWaiting, steps.length]);

  const handleStepComplete = (stepIndex: number) => {
    if (!completedSteps.includes(stepIndex)) {
      setCompletedSteps([...completedSteps, stepIndex]);
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    setIsWaiting(false);
  };

  const goToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
    setIsPlaying(false);
    setIsWaiting(false);
  };

  const getCurrentMove = () => {
    if (currentStep >= steps.length) return null;
    return steps[currentStep];
  };

  const parseFaceFromMove = (move: string) => {
    // Extract the main face letter from moves like "R", "R'", "R2", "U'", etc.
    const faceMatch = move.match(/^([RLUDFB])/);
    return faceMatch ? faceMatch[1] : null;
  };

  const currentMove = getCurrentMove();
  const currentFace = currentMove ? parseFaceFromMove(currentMove.move) : null;
  const faceInfo = currentFace ? CUBE_FACES[currentFace as keyof typeof CUBE_FACES] : null;

  return (
    <div className="space-y-6">
      {/* Live Visualization */}
      {isPlaying && currentMove && faceInfo && (
        <Card className="border-blue-500 bg-blue-500/10 animate-pulse">
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-6">
              <div className="text-center">
                <div className={`w-24 h-24 rounded-lg ${faceInfo.color} flex items-center justify-center mb-3 shadow-lg animate-bounce`}>
                  <Square className="text-white" size={32} />
                </div>
                <h3 className="text-lg font-bold text-white">{faceInfo.name} Face</h3>
              </div>
              <div className="text-center">
                <ChevronRight className="text-blue-400 mb-2" size={32} />
                <code className="px-4 py-2 bg-slate-800 rounded text-yellow-400 font-mono text-xl font-bold">
                  {currentMove.move}
                </code>
                <p className="text-slate-300 mt-2 text-sm">{currentMove.description}</p>
              </div>
            </div>
            {isWaiting && (
              <div className="mt-4 text-center">
                <div className="inline-flex items-center space-x-2 text-blue-400">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="text-sm">Waiting 2 seconds...</span>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Control Panel */}
      <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
        <div className="flex items-center space-x-4">
          <Button
            onClick={handlePlayPause}
            variant="outline"
            size="sm"
            className="border-slate-600"
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            {isPlaying ? 'Pause' : 'Play'}
          </Button>
          <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
            {completedSteps.length} / {steps.length} completed
          </Badge>
        </div>
        <div className="text-sm text-slate-400">
          Step {currentStep + 1} of {steps.length}
        </div>
      </div>

      {/* Steps List */}
      <div className="space-y-3">
        {steps.map((step, index) => {
          const stepFace = parseFaceFromMove(step.move);
          const stepFaceInfo = stepFace ? CUBE_FACES[stepFace as keyof typeof CUBE_FACES] : null;
          
          return (
            <Card
              key={index}
              className={`transition-all duration-300 cursor-pointer ${
                index === currentStep 
                  ? 'border-blue-500 bg-blue-500/10' 
                  : completedSteps.includes(index)
                  ? 'border-green-500 bg-green-500/5'
                  : 'border-slate-700 hover:border-slate-600'
              }`}
              onClick={() => goToStep(index)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    completedSteps.includes(index)
                      ? 'bg-green-500 text-white'
                      : index === currentStep
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-700 text-slate-400'
                  }`}>
                    {completedSteps.includes(index) ? (
                      <CheckCircle size={16} />
                    ) : (
                      index + 1
                    )}
                  </div>
                  
                  {stepFaceInfo && (
                    <div className={`w-6 h-6 rounded ${stepFaceInfo.color} flex-shrink-0`} title={`${stepFaceInfo.name} face`} />
                  )}
                  
                  <div className="flex-grow">
                    <div className="flex items-center space-x-3">
                      <code className="px-3 py-1 bg-slate-800 rounded text-yellow-400 font-mono">
                        {step.move}
                      </code>
                      <ChevronRight size={16} className="text-slate-500" />
                      <span className="text-slate-300">{step.description}</span>
                    </div>
                  </div>

                  <div className="flex-shrink-0 flex items-center space-x-2">
                    {index === currentStep && (
                      <Badge variant="outline" className="border-blue-500 text-blue-400">
                        Current
                      </Badge>
                    )}
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStepComplete(index);
                      }}
                      variant="ghost"
                      size="sm"
                      className={`${
                        completedSteps.includes(index) 
                          ? 'text-green-500 hover:text-green-400' 
                          : 'text-slate-500 hover:text-slate-400'
                      }`}
                    >
                      <RotateCw size={16} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-slate-400">
          <span>Progress</span>
          <span>{Math.round((completedSteps.length / steps.length) * 100)}%</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(completedSteps.length / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {completedSteps.length === steps.length && (
        <Card className="border-green-500 bg-green-500/10">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="text-green-500" size={24} />
              <div>
                <h3 className="text-green-400 font-semibold">Congratulations!</h3>
                <p className="text-slate-300 text-sm">
                  You've completed all the steps. Your Rubik's cube should now be solved!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
