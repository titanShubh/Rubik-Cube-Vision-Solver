// Optimized Kociemba-Style Algorithm - Fast and Efficient
import { CubeState, Move, MOVES, applyMove, isSolved, cubeToString } from './cube';
import { manhattanDistanceHeuristic } from './heuristics';

export async function solveWithKociemba(
  cube: CubeState,
  maxDepth: number = 12,
  onProgress?: (progress: { currentPhase: number; currentDepth: number; nodesExplored: number; timeElapsed: number }) => void
): Promise<{ solution: Move[]; nodesExplored: number; timeElapsed: number; found: boolean }> {
  const startTime = Date.now();
  let totalNodesExplored = 0;

  // Use simplified A* search with heuristic
  const result = await heuristicGuidedSearch(cube, maxDepth, (nodes, depth) => {
    totalNodesExplored += nodes;
    if (onProgress) {
      onProgress({
        currentPhase: 1,
        currentDepth: depth,
        nodesExplored: totalNodesExplored,
        timeElapsed: Date.now() - startTime
      });
    }
  });

  return {
    solution: result.solution,
    nodesExplored: totalNodesExplored,
    timeElapsed: Date.now() - startTime,
    found: result.found
  };
}

// Efficient heuristic-guided search (A*-like)
async function heuristicGuidedSearch(
  cube: CubeState,
  maxDepth: number,
  onProgress: (nodes: number, depth: number) => void
): Promise<{ solution: Move[]; found: boolean }> {
  interface SearchNode {
    cube: CubeState;
    path: Move[];
    g: number; // depth
    f: number; // g + heuristic
  }

  const frontier: SearchNode[] = [];
  const visited = new Set<string>();
  let nodesExplored = 0;

  // Initialize
  const startHeuristic = manhattanDistanceHeuristic(cube);
  frontier.push({ cube, path: [], g: 0, f: startHeuristic });

  while (frontier.length > 0) {
    // Sort by f-score (best first)
    frontier.sort((a, b) => a.f - b.f);
    const current = frontier.shift()!;
    
    nodesExplored++;
    
    if (nodesExplored % 200 === 0) {
      onProgress(200, current.g);
      await new Promise(resolve => setTimeout(resolve, 0));
    }

    const cubeKey = cubeToString(current.cube);
    if (visited.has(cubeKey)) continue;
    visited.add(cubeKey);

    if (isSolved(current.cube)) {
      return { solution: current.path, found: true };
    }

    if (current.g >= maxDepth) continue;

    // Expand neighbors
    for (const move of MOVES) {
      if (current.path.length > 0 && isRedundantMove(current.path[current.path.length - 1], move)) {
        continue;
      }

      const newCube = applyMove(current.cube, move);
      const newPath = [...current.path, move];
      const newG = current.g + 1;
      const newH = manhattanDistanceHeuristic(newCube);
      const newF = newG + newH;

      frontier.push({
        cube: newCube,
        path: newPath,
        g: newG,
        f: newF
      });
    }
  }

  return { solution: [], found: false };
}

// Helper function to avoid redundant moves (same as other algorithms)
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