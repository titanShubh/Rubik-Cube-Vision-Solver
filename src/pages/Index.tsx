
import { useState } from "react";
import { Camera, Upload, RotateCcw, Play, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CubeCapture } from "@/components/CubeCapture";
import { CubeViewer } from "@/components/CubeViewer";
import { SolutionSteps } from "@/components/SolutionSteps";
import { toast } from "sonner";

type AppState = 'capture' | 'analyze' | 'solve' | 'complete';

const Index = () => {
  const [currentState, setCurrentState] = useState<AppState>('capture');
  const [capturedSides, setCapturedSides] = useState<string[]>([]);
  const [cubeState, setCubeState] = useState<string[][][]>([]);
  const [solutionSteps, setSolutionSteps] = useState<any[]>([]);

  const handleSideCapture = (sideImage: string, sideIndex: number) => {
    const newSides = [...capturedSides];
    newSides[sideIndex] = sideImage;
    setCapturedSides(newSides);
    
    if (newSides.filter(Boolean).length === 6) {
      toast("All sides captured! Ready to analyze.", {
        icon: <CheckCircle className="text-green-500" />
      });
    }
  };

  const handleAnalyzeCube = async () => {
    setCurrentState('analyze');
    toast("Analyzing cube state...");
    
    // Simulate cube analysis
    setTimeout(() => {
      // Mock cube state - in real implementation, this would come from image analysis
      const mockCubeState = Array(6).fill(null).map(() => 
        Array(3).fill(null).map(() => Array(3).fill('white'))
      );
      setCubeState(mockCubeState);
      setCurrentState('solve');
      toast("Cube analyzed! Generating solution...");
    }, 2000);
  };

  const handleGenerateSolution = async () => {
    // Mock solution generation
    const mockSteps = [
      { move: "R U R'", description: "Start with right face clockwise" },
      { move: "U' F U F'", description: "Set up the cross" },
      { move: "R U' R' U", description: "Position corner piece" },
      { move: "F R U' R' F'", description: "Complete first layer" }
    ];
    setSolutionSteps(mockSteps);
    setCurrentState('complete');
    toast("Solution generated! Follow the steps below.");
  };

  const resetSolver = () => {
    setCurrentState('capture');
    setCapturedSides([]);
    setCubeState([]);
    setSolutionSteps([]);
    toast("Solver reset. Start with a new cube!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Rubik's Cube
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500">
              {" "}Solver
            </span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Capture images of all six sides of your cube and get step-by-step solving instructions
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[
              { state: 'capture', icon: Camera, label: 'Capture' },
              { state: 'analyze', icon: Upload, label: 'Analyze' },
              { state: 'solve', icon: Play, label: 'Solve' },
              { state: 'complete', icon: CheckCircle, label: 'Complete' }
            ].map(({ state, icon: Icon, label }, index) => (
              <div key={state} className="flex items-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                  currentState === state ? 'border-blue-500 bg-blue-500 text-white' :
                  ['capture', 'analyze', 'solve', 'complete'].indexOf(currentState) > index ? 'border-green-500 bg-green-500 text-white' :
                  'border-slate-600 bg-slate-800 text-slate-400'
                }`}>
                  <Icon size={20} />
                </div>
                <span className="ml-2 text-sm text-slate-300 hidden sm:block">{label}</span>
                {index < 3 && <div className="w-8 h-0.5 bg-slate-600 mx-4 hidden sm:block" />}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {currentState === 'capture' && (
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Camera className="text-blue-500" />
                  Capture Cube Sides
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Take clear photos of all six sides of your Rubik's cube. Make sure each face is well-lit and centered.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CubeCapture 
                  onSideCapture={handleSideCapture}
                  capturedSides={capturedSides}
                />
                <div className="mt-6 flex justify-center">
                  <Button 
                    onClick={handleAnalyzeCube}
                    disabled={capturedSides.filter(Boolean).length < 6}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  >
                    Analyze Cube State
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {currentState === 'analyze' && (
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white">Analyzing Cube...</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
                </div>
              </CardContent>
            </Card>
          )}

          {currentState === 'solve' && (
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white">Cube State Detected</CardTitle>
                <CardDescription className="text-slate-400">
                  Your cube has been analyzed. Generate the optimal solution.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <CubeViewer cubeState={cubeState} />
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="space-y-4">
                      <Badge variant="secondary" className="w-fit">
                        Ready to solve
                      </Badge>
                      <p className="text-slate-300">
                        The cube state has been successfully detected. Click below to generate the optimal solving sequence.
                      </p>
                      <Button 
                        onClick={handleGenerateSolution}
                        className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                      >
                        Generate Solution
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {currentState === 'complete' && (
            <div className="space-y-6">
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-lg">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <CheckCircle className="text-green-500" />
                    Solution Ready!
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Follow these steps to solve your Rubik's cube with minimum moves.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SolutionSteps steps={solutionSteps} />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Reset Button */}
          {currentState !== 'capture' && (
            <div className="flex justify-center mt-8">
              <Button 
                onClick={resetSolver}
                variant="outline"
                className="border-slate-600 hover:bg-slate-700"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Start Over
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
