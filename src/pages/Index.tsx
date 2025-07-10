import { useState } from 'react';
import { toast } from 'sonner';
import { CubeCapture } from '@/components/CubeCapture';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, RotateCcw, Play, Zap, Brain, Search, TreePine } from 'lucide-react';
import { CubeViewer } from '@/components/CubeViewer';
import { SolutionSteps } from '@/components/SolutionSteps';
import { solveWithIDA, solveWithBFS, solveWithDFS, generateScrambledCube, SolverProgress, solveWithKociemba } from '@/lib/solvers';
import { CubeState, Move } from '@/lib/cube';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Cpu } from 'lucide-react';

interface SolutionStep {
  move: string;
  description: string;
}

type AppState = 'capture' | 'analyze' | 'solve' | 'complete';
type SolverType = 'ida' | 'bfs' | 'dfs' | 'kociemba';

interface KociembaProgress {
  currentPhase: number;
  currentDepth: number;
  nodesExplored: number;
  timeElapsed: number;
}

export default function Index() {
  const [currentState, setCurrentState] = useState<AppState>('capture');
  const [capturedSides, setCapturedSides] = useState<string[]>(Array(6).fill(''));
  const [cubeState, setCubeState] = useState<CubeState>([]);
  const [solutionSteps, setSolutionSteps] = useState<SolutionStep[]>([]);
  const [selectedSolver, setSelectedSolver] = useState<SolverType>('kociemba');
  const [solverProgress, setSolverProgress] = useState<SolverProgress | KociembaProgress | null>(null);
  const [isGeneratingTestCube, setIsGeneratingTestCube] = useState(false);

  const handleSideCapture = (sideImage: string, sideIndex: number) => {
    const newSides = [...capturedSides];
    newSides[sideIndex] = sideImage;
    setCapturedSides(newSides);
    
    if (newSides.filter(Boolean).length === 6) {
      toast("All sides captured! Ready to analyze cube.");
    }
  };

  const handleAnalyzeCube = async () => {
    setCurrentState('analyze');
    toast("Analyzing cube state...");
    
    // Simulate cube analysis
    setTimeout(() => {
      // Mock cube state - in real implementation, this would come from image analysis
      const mockCubeState: CubeState = Array(6).fill(null).map(() => 
        Array(3).fill(null).map(() => Array(3).fill('white'))
      );
      setCubeState(mockCubeState);
      setCurrentState('solve');
      toast("Cube analyzed! Ready to solve.");
    }, 2000);
  };

  const handleGenerateTestCube = async () => {
    setIsGeneratingTestCube(true);
    toast("Generating scrambled test cube...");
    
    // Generate a scrambled cube for testing
    const { cube, scramble } = generateScrambledCube(15);
    setCubeState(cube);
    setCurrentState('solve');
    
    setIsGeneratingTestCube(false);
    toast(`Test cube generated with ${scramble.length} moves: ${scramble.join(' ')}`);
  };

  const handleGenerateSolution = async () => {
    if (!cubeState.length) {
      toast("No cube state to solve!");
      return;
    }

    setSolverProgress(null);
    toast(`Starting ${selectedSolver.toUpperCase()} solver...`);

    const onProgress = (progress: SolverProgress | KociembaProgress) => {
      setSolverProgress(progress);
    };

    try {
      let result;
      switch (selectedSolver) {
        case 'ida':
          result = await solveWithIDA(cubeState, 15, onProgress);
          break;
        case 'bfs':
          result = await solveWithBFS(cubeState, 8, onProgress);
          break;
        case 'dfs':
          result = await solveWithDFS(cubeState, 12, onProgress as (progress: SolverProgress) => void);
          break;
        case 'kociemba':
          result = await solveWithKociemba(cubeState, 24, onProgress as (progress: KociembaProgress) => void);
          break;
      }

      if (result.found) {
        const steps = result.solution.map((move: Move, index: number) => ({
          move,
          description: `Step ${index + 1}: ${getMoveName(move)}`
        }));
        
        setSolutionSteps(steps);
        setCurrentState('complete');
        toast(`Solution found in ${result.timeElapsed}ms! ${result.solution.length} moves, ${result.nodesExplored} nodes explored.`);
      } else {
        toast(`No solution found within depth limit. Explored ${result.nodesExplored} nodes in ${result.timeElapsed}ms.`);
      }
    } catch (error) {
      toast("Error during solving: " + (error as Error).message);
    } finally {
      setSolverProgress(null);
    }
  };

  const resetSolver = () => {
    setCurrentState('capture');
    setCapturedSides(Array(6).fill(''));
    setCubeState([]);
    setSolutionSteps([]);
    setSolverProgress(null);
    toast("Solver reset. Start with a new cube!");
  };

  const getMoveName = (move: Move): string => {
    const moveNames: Record<string, string> = {
      'R': 'Right face clockwise',
      "R'": 'Right face counter-clockwise',
      'R2': 'Right face 180°',
      'L': 'Left face clockwise', 
      "L'": 'Left face counter-clockwise',
      'L2': 'Left face 180°',
      'U': 'Upper face clockwise',
      "U'": 'Upper face counter-clockwise', 
      'U2': 'Upper face 180°',
      'D': 'Down face clockwise',
      "D'": 'Down face counter-clockwise',
      'D2': 'Down face 180°',
      'F': 'Front face clockwise',
      "F'": 'Front face counter-clockwise',
      'F2': 'Front face 180°',
      'B': 'Back face clockwise',
      "B'": 'Back face counter-clockwise',
      'B2': 'Back face 180°'
    };
    return moveNames[move] || move;
  };

  const getStateProgress = () => {
    const states = ['capture', 'analyze', 'solve', 'complete'];
    return ((states.indexOf(currentState) + 1) / states.length) * 100;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Rubik's Cube Solver
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Advanced algorithms: IDA* (Korf), BFS, and DFS for optimal cube solving
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Capture</span>
            <span>Analyze</span>
            <span>Solve</span>
            <span>Complete</span>
          </div>
          <Progress value={getStateProgress()} className="h-2" />
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto space-y-6">
          {currentState === 'capture' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="text-blue-500" size={24} />
                  Capture Cube Images
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CubeCapture 
                  onSideCapture={handleSideCapture}
                  capturedSides={capturedSides}
                />
                <Separator className="my-6" />
                <div className="flex justify-center">
                  <Button
                    onClick={handleAnalyzeCube}
                    disabled={capturedSides.filter(Boolean).length < 6}
                    size="lg"
                  >
                    Analyze Cube State
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {currentState === 'analyze' && (
            <Card>
              <CardHeader>
                <CardTitle>Analyzing Cube State...</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
                </div>
              </CardContent>
            </Card>
          )}

          {currentState === 'solve' && (
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Cube State</CardTitle>
                </CardHeader>
                <CardContent>
                  <CubeViewer cubeState={cubeState} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="text-primary" size={24} />
                    Solve Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Algorithm
                    </label>
                    <Select value={selectedSolver} onValueChange={(value: SolverType) => setSelectedSolver(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kociemba">
                          <div className="flex items-center gap-2">
                            <Cpu size={16} />
                            Kociemba (Two-Phase)
                          </div>
                        </SelectItem>
                        <SelectItem value="ida">
                          <div className="flex items-center gap-2">
                            <Brain size={16} />
                            IDA* (Korf's Algorithm)
                          </div>
                        </SelectItem>
                        <SelectItem value="bfs">
                          <div className="flex items-center gap-2">
                            <Search size={16} />
                            BFS (Breadth-First Search)
                          </div>
                        </SelectItem>
                        <SelectItem value="dfs">
                          <div className="flex items-center gap-2">
                            <TreePine size={16} />
                            DFS (Depth-First Search)
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {solverProgress && (
                    <div className="space-y-2 p-3 bg-muted rounded-lg">
                      <div className="text-sm font-medium">Solving Progress</div>
                      <div className="text-xs text-muted-foreground">
                        {('currentPhase' in solverProgress) ? (
                          <>
                            Phase: {solverProgress.currentPhase}/2 | 
                            Depth: {solverProgress.currentDepth} | 
                            Nodes: {solverProgress.nodesExplored.toLocaleString()} | 
                            Time: {(solverProgress.timeElapsed / 1000).toFixed(1)}s
                          </>
                        ) : (
                          <>
                            Depth: {solverProgress.currentDepth} | 
                            Nodes: {solverProgress.nodesExplored.toLocaleString()} | 
                            Time: {(solverProgress.timeElapsed / 1000).toFixed(1)}s
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Button
                      onClick={handleGenerateSolution}
                      className="w-full"
                      size="lg"
                      disabled={!!solverProgress}
                    >
                      <Play className="mr-2" size={20} />
                      {solverProgress ? 'Solving...' : 'Generate Solution'}
                    </Button>
                    
                    <Button
                      onClick={handleGenerateTestCube}
                      variant="outline"
                      className="w-full"
                      disabled={isGeneratingTestCube}
                    >
                      {isGeneratingTestCube ? 'Generating...' : 'Generate Test Cube'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {currentState === 'complete' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <Play className="text-green-600" size={24} />
                  Solution Steps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SolutionSteps steps={solutionSteps} />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Reset Button */}
        {currentState !== 'capture' && (
          <div className="flex justify-center mt-8">
            <Button onClick={resetSolver} variant="outline">
              <RotateCcw className="mr-2" size={16} />
              Start Over
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}