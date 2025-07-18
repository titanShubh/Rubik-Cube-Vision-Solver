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

// Fast iterative deepening search with aggressive pruning
async function heuristicGuidedSearch(
  cube: CubeState,
  maxDepth: number,
  onProgress: (nodes: number, depth: number) => void
): Promise<{ solution: Move[]; found: boolean }> {
  let nodesExplored = 0;
  
  // Try iterative deepening with very aggressive limits
  for (let depth = 1; depth <= Math.min(maxDepth, 8); depth++) {
    const result = await depthLimitedSearch(cube, depth, onProgress, nodesExplored);
    nodesExplored += result.nodesExplored;
    
    if (result.found) {
      return { solution: result.solution, found: true };
    }
    
    // Early exit if we've explored too many nodes
    if (nodesExplored > 5000) {
      break;
    }
  }

  return { solution: [], found: false };
}

// Depth-limited search with beam search optimization
async function depthLimitedSearch(
  cube: CubeState,
  maxDepth: number,
  onProgress: (nodes: number, depth: number) => void,
  initialNodes: number
): Promise<{ solution: Move[]; found: boolean; nodesExplored: number }> {
  interface SearchNode {
    cube: CubeState;
    path: Move[];
    heuristic: number;
  }

  let currentLevel: SearchNode[] = [{ cube, path: [], heuristic: manhattanDistanceHeuristic(cube) }];
  let nodesExplored = 0;
  const visited = new Set<string>();
  const MAX_BEAM_WIDTH = 100; // Limit beam width for performance

  for (let depth = 0; depth < maxDepth; depth++) {
    const nextLevel: SearchNode[] = [];
    
    // Sort current level by heuristic (best first)
    currentLevel.sort((a, b) => a.heuristic - b.heuristic);
    
    // Beam search: only keep the best nodes
    currentLevel = currentLevel.slice(0, MAX_BEAM_WIDTH);
    
    for (const node of currentLevel) {
      nodesExplored++;
      
      if (nodesExplored % 100 === 0) {
        onProgress(100, depth);
        await new Promise(resolve => setTimeout(resolve, 0));
      }

      const cubeKey = cubeToString(node.cube);
      if (visited.has(cubeKey)) continue;
      visited.add(cubeKey);

      if (isSolved(node.cube)) {
        return { solution: node.path, found: true, nodesExplored };
      }

      // Expand neighbors
      for (const move of MOVES) {
        if (node.path.length > 0 && isRedundantMove(node.path[node.path.length - 1], move)) {
          continue;
        }

        const newCube = applyMove(node.cube, move);
        const newPath = [...node.path, move];
        const newHeuristic = manhattanDistanceHeuristic(newCube);
        
        // Aggressive pruning: skip if heuristic is too high
        if (newHeuristic > maxDepth - depth - 1) continue;

        nextLevel.push({
          cube: newCube,
          path: newPath,
          heuristic: newHeuristic
        });
      }
    }
    
    currentLevel = nextLevel;
    
    // Early exit if no more nodes to explore
    if (currentLevel.length === 0) break;
  }

  return { solution: [], found: false, nodesExplored };
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