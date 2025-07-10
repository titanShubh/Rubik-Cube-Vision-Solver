// Kociemba's Two-Phase Algorithm Implementation
import { CubeState, Move, MOVES, applyMove, isSolved, cubeToString, cloneCube } from './cube';

// Phase 1: Reach subgroup H where:
// - Edge orientation is correct
// - Corner orientation is correct  
// - UD slice edges are in UD slice
interface KociembaState {
  cube: CubeState;
  edgeOrientation: number[];
  cornerOrientation: number[];
  udSliceEdges: number[];
}

// Lookup tables for phase transitions
const PHASE1_MOVES = ['R', "R'", 'R2', 'L', "L'", 'L2', 'U', "U'", 'U2', 'D', "D'", 'D2', 'F', "F'", 'F2', 'B', "B'", 'B2'] as const;
const PHASE2_MOVES = ['R', "R'", 'R2', 'L', "L'", 'L2', 'U', "U'", 'U2', 'D', "D'", 'D2', 'F2', 'B2'] as const;

export async function solveWithKociemba(
  cube: CubeState,
  maxDepth: number = 24,
  onProgress?: (progress: { currentPhase: number; currentDepth: number; nodesExplored: number; timeElapsed: number }) => void
): Promise<{ solution: Move[]; nodesExplored: number; timeElapsed: number; found: boolean }> {
  const startTime = Date.now();
  let nodesExplored = 0;

  // Phase 1: Get to subgroup H
  const phase1Result = await phase1Search(cube, 12, (depth, nodes) => {
    nodesExplored += nodes;
    if (onProgress) {
      onProgress({
        currentPhase: 1,
        currentDepth: depth,
        nodesExplored,
        timeElapsed: Date.now() - startTime
      });
    }
  });

  if (!phase1Result.found) {
    return {
      solution: [],
      nodesExplored,
      timeElapsed: Date.now() - startTime,
      found: false
    };
  }

  // Apply phase 1 solution to get intermediate state
  let intermediateCube = cube;
  for (const move of phase1Result.solution) {
    intermediateCube = applyMove(intermediateCube, move);
  }

  // Phase 2: Solve within subgroup H
  const phase2Result = await phase2Search(intermediateCube, 18, (depth, nodes) => {
    nodesExplored += nodes;
    if (onProgress) {
      onProgress({
        currentPhase: 2,
        currentDepth: depth,
        nodesExplored,
        timeElapsed: Date.now() - startTime
      });
    }
  });

  if (!phase2Result.found) {
    return {
      solution: phase1Result.solution,
      nodesExplored,
      timeElapsed: Date.now() - startTime,
      found: false
    };
  }

  return {
    solution: [...phase1Result.solution, ...phase2Result.solution],
    nodesExplored,
    timeElapsed: Date.now() - startTime,
    found: true
  };
}

// Phase 1: Search for subgroup H
async function phase1Search(
  cube: CubeState,
  maxDepth: number,
  onProgress: (depth: number, nodes: number) => void
): Promise<{ solution: Move[]; found: boolean }> {
  let nodesThisCall = 0;

  const search = async (
    currentCube: CubeState,
    path: Move[],
    depth: number,
    maxD: number,
    visited: Set<string>
  ): Promise<Move[] | null> => {
    nodesThisCall++;

    if (nodesThisCall % 500 === 0) {
      onProgress(depth, nodesThisCall);
      nodesThisCall = 0;
      await new Promise(resolve => setTimeout(resolve, 0));
    }

    const cubeKey = cubeToString(currentCube);
    if (visited.has(cubeKey)) {
      return null;
    }

    if (isInSubgroupH(currentCube)) {
      return path;
    }

    if (depth >= maxD) {
      return null;
    }

    visited.add(cubeKey);

    for (const move of PHASE1_MOVES) {
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

  // Iterative deepening for phase 1
  for (let depth = 0; depth <= maxDepth; depth++) {
    const result = await search(cube, [], 0, depth, new Set());
    if (result) {
      return { solution: result, found: true };
    }
  }

  return { solution: [], found: false };
}

// Phase 2: Search within subgroup H
async function phase2Search(
  cube: CubeState,
  maxDepth: number,
  onProgress: (depth: number, nodes: number) => void
): Promise<{ solution: Move[]; found: boolean }> {
  let nodesThisCall = 0;

  const search = async (
    currentCube: CubeState,
    path: Move[],
    depth: number,
    maxD: number,
    visited: Set<string>
  ): Promise<Move[] | null> => {
    nodesThisCall++;

    if (nodesThisCall % 500 === 0) {
      onProgress(depth, nodesThisCall);
      nodesThisCall = 0;
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

    for (const move of PHASE2_MOVES) {
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

  // Iterative deepening for phase 2
  for (let depth = 0; depth <= maxDepth; depth++) {
    const result = await search(cube, [], 0, depth, new Set());
    if (result) {
      return { solution: result, found: true };
    }
  }

  return { solution: [], found: false };
}

// Check if cube is in subgroup H
function isInSubgroupH(cube: CubeState): boolean {
  // Simplified check for subgroup H conditions:
  // 1. All edges must have correct orientation
  // 2. All corners must have correct orientation
  // 3. UD slice edges must be in UD slice positions

  return (
    hasCorrectEdgeOrientation(cube) &&
    hasCorrectCornerOrientation(cube) &&
    hasUDSliceEdgesInPlace(cube)
  );
}

// Check edge orientation (simplified)
function hasCorrectEdgeOrientation(cube: CubeState): boolean {
  // In a real implementation, this would check if all edges
  // can be oriented correctly using only R, L, U, D, F2, B2 moves
  
  // For this simplified version, we check some basic edge orientation conditions
  const edgePositions = [
    [[0, 0, 1], [5, 0, 1]], // Top-back edge
    [[0, 1, 0], [4, 0, 1]], // Top-left edge
    [[0, 1, 2], [1, 0, 1]], // Top-right edge
    [[0, 2, 1], [2, 0, 1]]  // Top-front edge
  ];

  for (const edge of edgePositions) {
    const colors = edge.map(([face, row, col]) => cube[face][row][col]);
    // Simplified orientation check
    if (!isEdgeCorrectlyOriented(colors, edge)) {
      return false;
    }
  }

  return true;
}

// Check corner orientation (simplified)
function hasCorrectCornerOrientation(cube: CubeState): boolean {
  // Check if corners can be oriented using phase 2 moves
  const cornerPositions = [
    [[0, 0, 0], [4, 0, 2], [5, 0, 0]], // Top-left-back corner
    [[0, 0, 2], [1, 0, 0], [5, 0, 2]], // Top-right-back corner
    [[0, 2, 0], [2, 0, 0], [4, 0, 0]], // Top-left-front corner
    [[0, 2, 2], [1, 0, 2], [2, 0, 2]]  // Top-right-front corner
  ];

  for (const corner of cornerPositions) {
    const colors = corner.map(([face, row, col]) => cube[face][row][col]);
    if (!isCornerCorrectlyOriented(colors, corner)) {
      return false;
    }
  }

  return true;
}

// Check if UD slice edges are in UD slice
function hasUDSliceEdgesInPlace(cube: CubeState): boolean {
  // Check if the four edges that belong in the middle slice
  // are actually in middle slice positions
  const udSlicePositions = [
    [[1, 1, 0], [5, 1, 2]], // Right-back edge
    [[1, 1, 2], [2, 1, 2]], // Right-front edge  
    [[2, 1, 0], [4, 1, 2]], // Front-left edge
    [[4, 1, 0], [5, 1, 0]]  // Left-back edge
  ];

  // Simplified check - in real implementation would verify
  // that UD slice edges are in their proper slice
  return udSlicePositions.every(edge => {
    const colors = edge.map(([face, row, col]) => cube[face][row][col]);
    return isUDSliceEdge(colors);
  });
}

// Helper functions for orientation checks
function isEdgeCorrectlyOriented(colors: string[], positions: number[][]): boolean {
  // Simplified orientation check
  const [face1, face2] = positions.map(([face]) => face);
  
  // Check if edge orientation allows phase 2 solving
  if ((face1 === 0 || face1 === 3) && (face2 === 0 || face2 === 3)) {
    // UD edge - check if UD colors are on UD faces
    return (colors[0] === 'white' || colors[0] === 'yellow') || 
           (colors[1] === 'white' || colors[1] === 'yellow');
  }
  
  return true; // Simplified for other cases
}

function isCornerCorrectlyOriented(colors: string[], positions: number[][]): boolean {
  // Simplified corner orientation check
  // In real implementation, would check twist state
  const udFaces = positions.filter(([face]) => face === 0 || face === 3);
  const udColors = colors.filter(color => color === 'white' || color === 'yellow');
  
  return udFaces.length === udColors.length;
}

function isUDSliceEdge(colors: string[]): boolean {
  // Check if this edge belongs in the UD slice
  const udColors = colors.filter(color => color === 'white' || color === 'yellow');
  return udColors.length === 0; // UD slice edges don't contain white or yellow
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