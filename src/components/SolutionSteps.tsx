
import { useState } from "react";
import { Play, Pause, RotateCw, ChevronRight, CheckCircle } from "lucide-react";
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

export const SolutionSteps = ({ steps }: SolutionStepsProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const handleStepComplete = (stepIndex: number) => {
    if (!completedSteps.includes(stepIndex)) {
      setCompletedSteps([...completedSteps, stepIndex]);
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    // In a real implementation, this would control animation playback
  };

  const goToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  return (
    <div className="space-y-6">
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
        {steps.map((step, index) => (
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
        ))}
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
