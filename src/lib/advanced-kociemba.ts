// Improved Kociemba Algorithm with working heuristics
import { CubeState, Move, MOVES, applyMove, isSolved } from './cube';
import { manhattanDistanceHeuristic } from './heuristics';

// IDA* implementation with proper heuristics
export async function solveWithAdvancedKociemba(
  cube: CubeState,
  maxDepth: number = 25,
  onProgress?: (progress: { currentPhase: number; currentDepth: number; nodesExplored: number; timeElapsed: number }) => void
): Promise<{ solution: Move[]; nodesExplored: number; timeElapsed: number; found: boolean }> {
  const startTime = Date.now();
  let totalNodes = 0;

  if (isSolved(cube)) {
    return { solution: [], nodesExplored: 0, timeElapsed: 0, found: true };
  }

  // Use IDA* with iterative deepening
  let bound = enhancedHeuristic(cube);
  const path: Move[] = [];

  while (bound <= maxDepth) {
    const result = await search(cube, 0, bound, path, null, startTime, (nodes, depth) => {
      totalNodes += nodes;
      if (onProgress) {
        onProgress({
          currentPhase: 1,
          currentDepth: depth,
          nodesExplored: totalNodes,
          timeElapsed: Date.now() - startTime
        });
      }
    });

    if (result === 'FOUND') {
      return {
        solution: [...path],
        nodesExplored: totalNodes,
        timeElapsed: Date.now() - startTime,
        found: true
      };
    }

    if (result === Infinity) break;
    bound = result;

    // Timeout after 60 seconds
    if (Date.now() - startTime > 60000) break;
  }

  return {
    solution: [],
    nodesExplored: totalNodes,
    timeElapsed: Date.now() - startTime,
    found: false
  };
}

async function search(
  cube: CubeState,
  g: number,
  bound: number,
  path: Move[],
  lastMove: Move | null,
  startTime: number,
  onProgress: (nodes: number, depth: number) => void
): Promise<number | 'FOUND'> {
  const f = g + enhancedHeuristic(cube);
  if (f > bound) return f;
  
  if (isSolved(cube)) return 'FOUND';

  // Progress and timeout check
  if (g % 100 === 0) {
    onProgress(100, g);
    await new Promise(resolve => setTimeout(resolve, 0));
    
    if (Date.now() - startTime > 60000) return Infinity;
  }

  let minimum = Infinity;

  // Try moves in a better order
  const orderedMoves = getOrderedMoves(cube, lastMove);

  for (const move of orderedMoves) {
    if (lastMove && isRedundantMove(lastMove, move)) continue;

    const newCube = applyMove(cube, move);
    path.push(move);

    const t = await search(newCube, g + 1, bound, path, move, startTime, onProgress);
    
    if (t === 'FOUND') return 'FOUND';
    if (t < minimum) minimum = t;

    path.pop();
  }

  return minimum;
}

// Enhanced heuristic function
function enhancedHeuristic(cube: CubeState): number {
  let h1 = manhattanDistanceHeuristic(cube);
  let h2 = cornerHeuristic(cube);
  let h3 = edgeHeuristic(cube);
  
  return Math.max(h1, h2, h3);
}

// Corner-based heuristic
function cornerHeuristic(cube: CubeState): number {
  let misplacedCorners = 0;
  
  // Check corner positions (simplified)
  const corners = [
    [cube[0][0][0], cube[4][0][2], cube[5][0][0]], // ULB
    [cube[0][0][2], cube[5][0][2], cube[1][0][0]], // URB  
    [cube[0][2][0], cube[2][0][0], cube[4][0][0]], // ULF
    [cube[0][2][2], cube[1][0][2], cube[2][0][2]], // URF
    [cube[3][0][0], cube[4][2][0], cube[2][2][0]], // DLF
    [cube[3][0][2], cube[2][2][2], cube[1][2][0]], // DRF
    [cube[3][2][0], cube[5][2][0], cube[4][2][2]], // DLB
    [cube[3][2][2], cube[1][2][2], cube[5][2][2]]  // DRB
  ];

  const solvedCorners = [
    ['white', 'orange', 'blue'],
    ['white', 'blue', 'red'],
    ['white', 'green', 'orange'],
    ['white', 'red', 'green'],
    ['yellow', 'orange', 'green'],
    ['yellow', 'green', 'red'],
    ['yellow', 'blue', 'orange'],
    ['yellow', 'red', 'blue']
  ];

  for (let i = 0; i < 8; i++) {
    if (!arraysEqual(corners[i].sort(), solvedCorners[i].sort())) {
      misplacedCorners++;
    }
  }

  return Math.ceil(misplacedCorners / 4);
}

// Edge-based heuristic  
function edgeHeuristic(cube: CubeState): number {
  let misplacedEdges = 0;
  
  // Check edge positions
  const edges = [
    [cube[0][0][1], cube[5][0][1]], // UB
    [cube[0][1][0], cube[4][0][1]], // UL
    [cube[0][1][2], cube[1][0][1]], // UR
    [cube[0][2][1], cube[2][0][1]], // UF
    [cube[3][0][1], cube[2][2][1]], // DF
    [cube[3][1][0], cube[4][2][1]], // DL
    [cube[3][1][2], cube[1][2][1]], // DR
    [cube[3][2][1], cube[5][2][1]], // DB
    [cube[2][1][0], cube[4][1][2]], // FL
    [cube[2][1][2], cube[1][1][0]], // FR
    [cube[5][1][0], cube[4][1][0]], // BL
    [cube[5][1][2], cube[1][1][2]]  // BR
  ];

  const solvedEdges = [
    ['white', 'blue'], ['white', 'orange'], ['white', 'red'], ['white', 'green'],
    ['yellow', 'green'], ['yellow', 'orange'], ['yellow', 'red'], ['yellow', 'blue'],
    ['green', 'orange'], ['green', 'red'], ['blue', 'orange'], ['blue', 'red']
  ];

  for (let i = 0; i < 12; i++) {
    if (!arraysEqual(edges[i].sort(), solvedEdges[i].sort())) {
      misplacedEdges++;
    }
  }

  return Math.ceil(misplacedEdges / 4);
}

// Better move ordering based on cube state
function getOrderedMoves(cube: CubeState, lastMove: Move | null): Move[] {
  const moves = [...MOVES];
  
  // Simple move ordering: prefer moves that might help current state
  if (lastMove) {
    // Put related moves first
    const face = lastMove[0];
    const related = moves.filter(m => m[0] === face);
    const others = moves.filter(m => m[0] !== face);
    return [...others, ...related]; // Actually put unrelated first to avoid same-face
  }
  
  return moves;
}

function isRedundantMove(lastMove: Move, currentMove: Move): boolean {
  // Same face moves are redundant
  if (lastMove[0] === currentMove[0]) return true;

  // Opposite face moves in wrong order
  const oppositeFaces: Record<string, string> = {
    'R': 'L', 'L': 'R',
    'U': 'D', 'D': 'U',
    'F': 'B', 'B': 'F'
  };

  const lastFace = lastMove[0];
  const currentFace = currentMove[0];

  return oppositeFaces[lastFace] === currentFace && lastMove > currentMove;
}

function arraysEqual(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((val, i) => val === b[i]);
}