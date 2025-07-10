// Rubik's cube solving algorithms: IDA*, DFS, BFS
import { CubeState, Move, MOVES, applyMove, isSolved, cubeToString, cloneCube } from './cube';
import { manhattanDistanceHeuristic, patternDatabaseHeuristic } from './heuristics';

// Re-export Kociemba algorithm
export { solveWithKociemba } from './kociemba';

export interface SolverResult {
  solution: Move[];
  nodesExplored: number;
  timeElapsed: number;
  found: boolean;
}

export interface SolverProgress {
  currentDepth: number;
  nodesExplored: number;
  timeElapsed: number;
}

// IDA* (Iterative Deepening A*) - Korf's algorithm
export async function solveWithIDA(
  cube: CubeState,
  maxDepth: number = 20,
  onProgress?: (progress: SolverProgress) => void
): Promise<SolverResult> {
  const startTime = Date.now();
  let nodesExplored = 0;
  
  const search = async (
    currentCube: CubeState,
    path: Move[],
    g: number,
    threshold: number,
    visited: Set<string>
  ): Promise<{ found: boolean; newThreshold: number }> => {
    nodesExplored++;
    
    // Progress callback every 1000 nodes
    if (nodesExplored % 1000 === 0 && onProgress) {
      onProgress({
        currentDepth: g,
        nodesExplored,
        timeElapsed: Date.now() - startTime
      });
      
      // Allow UI to update
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    
    const cubeKey = cubeToString(currentCube);
    if (visited.has(cubeKey)) {
      return { found: false, newThreshold: Infinity };
    }
    
    const h = manhattanDistanceHeuristic(currentCube);
    const f = g + h;
    
    if (f > threshold) {
      return { found: false, newThreshold: f };
    }
    
    if (isSolved(currentCube)) {
      return { found: true, newThreshold: threshold };
    }
    
    if (g >= maxDepth) {
      return { found: false, newThreshold: Infinity };
    }
    
    visited.add(cubeKey);
    let minThreshold = Infinity;
    
    for (const move of MOVES) {
      // Avoid redundant moves
      if (path.length > 0 && isRedundantMove(path[path.length - 1], move)) {
        continue;
      }
      
      const newCube = applyMove(currentCube, move);
      const result = await search(newCube, [...path, move], g + 1, threshold, new Set(visited));
      
      if (result.found) {
        return result;
      }
      
      minThreshold = Math.min(minThreshold, result.newThreshold);
    }
    
    visited.delete(cubeKey);
    return { found: false, newThreshold: minThreshold };
  };
  
  let threshold = manhattanDistanceHeuristic(cube);
  const solution: Move[] = [];
  
  while (threshold <= maxDepth && threshold !== Infinity) {
    const result = await search(cube, solution, 0, threshold, new Set());
    
    if (result.found) {
      return {
        solution,
        nodesExplored,
        timeElapsed: Date.now() - startTime,
        found: true
      };
    }
    
    threshold = result.newThreshold;
  }
  
  return {
    solution: [],
    nodesExplored,
    timeElapsed: Date.now() - startTime,
    found: false
  };
}

// Breadth-First Search
export async function solveWithBFS(
  cube: CubeState,
  maxDepth: number = 12,
  onProgress?: (progress: SolverProgress) => void
): Promise<SolverResult> {
  const startTime = Date.now();
  let nodesExplored = 0;
  
  interface SearchNode {
    cube: CubeState;
    path: Move[];
    depth: number;
  }
  
  const queue: SearchNode[] = [{ cube, path: [], depth: 0 }];
  const visited = new Set<string>();
  visited.add(cubeToString(cube));
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    nodesExplored++;
    
    // Progress callback every 100 nodes
    if (nodesExplored % 100 === 0 && onProgress) {
      onProgress({
        currentDepth: current.depth,
        nodesExplored,
        timeElapsed: Date.now() - startTime
      });
      
      // Allow UI to update
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    
    if (isSolved(current.cube)) {
      return {
        solution: current.path,
        nodesExplored,
        timeElapsed: Date.now() - startTime,
        found: true
      };
    }
    
    if (current.depth >= maxDepth) {
      continue;
    }
    
    for (const move of MOVES) {
      // Avoid redundant moves
      if (current.path.length > 0 && isRedundantMove(current.path[current.path.length - 1], move)) {
        continue;
      }
      
      const newCube = applyMove(current.cube, move);
      const cubeKey = cubeToString(newCube);
      
      if (!visited.has(cubeKey)) {
        visited.add(cubeKey);
        queue.push({
          cube: newCube,
          path: [...current.path, move],
          depth: current.depth + 1
        });
      }
    }
  }
  
  return {
    solution: [],
    nodesExplored,
    timeElapsed: Date.now() - startTime,
    found: false
  };
}

// Depth-First Search with iterative deepening
export async function solveWithDFS(
  cube: CubeState,
  maxDepth: number = 15,
  onProgress?: (progress: SolverProgress) => void
): Promise<SolverResult> {
  const startTime = Date.now();
  let nodesExplored = 0;
  
  const search = async (
    currentCube: CubeState,
    path: Move[],
    depth: number,
    maxD: number,
    visited: Set<string>
  ): Promise<Move[] | null> => {
    nodesExplored++;
    
    // Progress callback every 1000 nodes
    if (nodesExplored % 1000 === 0 && onProgress) {
      onProgress({
        currentDepth: depth,
        nodesExplored,
        timeElapsed: Date.now() - startTime
      });
      
      // Allow UI to update
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    
    const cubeKey = cubeToString(currentCube);
    if (visited.has(cubeKey)) {
      return null;
    }
    
    if (isSolved(currentCube)) {
      return path;
    }
    
    if (depth >= maxD) {
      return null;
    }
    
    visited.add(cubeKey);
    
    for (const move of MOVES) {
      // Avoid redundant moves
      if (path.length > 0 && isRedundantMove(path[path.length - 1], move)) {
        continue;
      }
      
      const newCube = applyMove(currentCube, move);
      const result = await search(newCube, [...path, move], depth + 1, maxD, new Set(visited));
      
      if (result) {
        return result;
      }
    }
    
    visited.delete(cubeKey);
    return null;
  };
  
  // Iterative deepening
  for (let depth = 1; depth <= maxDepth; depth++) {
    const result = await search(cube, [], 0, depth, new Set());
    if (result) {
      return {
        solution: result,
        nodesExplored,
        timeElapsed: Date.now() - startTime,
        found: true
      };
    }
  }
  
  return {
    solution: [],
    nodesExplored,
    timeElapsed: Date.now() - startTime,
    found: false
  };
}

// Helper function to avoid redundant moves
function isRedundantMove(lastMove: Move, currentMove: Move): boolean {
  // Same face moves
  if (lastMove[0] === currentMove[0]) {
    return true;
  }
  
  // Opposite face moves that can be optimized
  const oppositeFaces: Record<string, string> = {
    'R': 'L', 'L': 'R',
    'U': 'D', 'D': 'U', 
    'F': 'B', 'B': 'F'
  };
  
  const lastFace = lastMove[0];
  const currentFace = currentMove[0];
  
  return oppositeFaces[lastFace] === currentFace && lastMove > currentMove;
}

// Generate a scrambled cube for testing
export function generateScrambledCube(moves: number = 20): { cube: CubeState; scramble: Move[] } {
  const cube = cloneCube([
    [['white', 'white', 'white'], ['white', 'white', 'white'], ['white', 'white', 'white']], // Up
    [['red', 'red', 'red'], ['red', 'red', 'red'], ['red', 'red', 'red']], // Right
    [['green', 'green', 'green'], ['green', 'green', 'green'], ['green', 'green', 'green']], // Front
    [['yellow', 'yellow', 'yellow'], ['yellow', 'yellow', 'yellow'], ['yellow', 'yellow', 'yellow']], // Down
    [['orange', 'orange', 'orange'], ['orange', 'orange', 'orange'], ['orange', 'orange', 'orange']], // Left
    [['blue', 'blue', 'blue'], ['blue', 'blue', 'blue'], ['blue', 'blue', 'blue']] // Back
  ]);
  
  const scramble: Move[] = [];
  let currentCube = cube;
  
  for (let i = 0; i < moves; i++) {
    let move: Move;
    do {
      move = MOVES[Math.floor(Math.random() * MOVES.length)];
    } while (scramble.length > 0 && isRedundantMove(scramble[scramble.length - 1], move));
    
    scramble.push(move);
    currentCube = applyMove(currentCube, move);
  }
  
  return { cube: currentCube, scramble };
}