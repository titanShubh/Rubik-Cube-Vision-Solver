// Heuristic functions for Rubik's cube solving
import { CubeState } from './cube';

// Manhattan distance heuristic for IDA*
export function manhattanDistanceHeuristic(cube: CubeState): number {
  let distance = 0;
  
  // Count pieces that are not in their correct position
  for (let face = 0; face < 6; face++) {
    const targetColor = getTargetColor(face);
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        if (cube[face][row][col] !== targetColor) {
          distance++;
        }
      }
    }
  }
  
  return Math.floor(distance / 8); // Rough estimate of moves needed
}

// Pattern database heuristic (simplified)
export function patternDatabaseHeuristic(cube: CubeState): number {
  let score = 0;
  
  // Corner pieces heuristic
  score += cornerHeuristic(cube);
  
  // Edge pieces heuristic  
  score += edgeHeuristic(cube);
  
  return score;
}

function cornerHeuristic(cube: CubeState): number {
  let misplacedCorners = 0;
  
  // Check all 8 corners
  const corners = [
    // Corner positions: [face, row, col] for each sticker of the corner
    [[0, 0, 0], [4, 0, 2], [5, 0, 0]], // Top-left-back
    [[0, 0, 2], [1, 0, 0], [5, 0, 2]], // Top-right-back
    [[0, 2, 0], [2, 0, 0], [4, 0, 0]], // Top-left-front
    [[0, 2, 2], [1, 0, 2], [2, 0, 2]], // Top-right-front
    [[3, 0, 0], [2, 2, 0], [4, 2, 0]], // Bottom-left-front
    [[3, 0, 2], [1, 2, 2], [2, 2, 2]], // Bottom-right-front
    [[3, 2, 0], [4, 2, 2], [5, 2, 0]], // Bottom-left-back
    [[3, 2, 2], [1, 2, 0], [5, 2, 2]]  // Bottom-right-back
  ];
  
  for (const corner of corners) {
    const colors = corner.map(([face, row, col]) => cube[face][row][col]);
    if (!isCornerInCorrectPosition(colors, corner)) {
      misplacedCorners++;
    }
  }
  
  return Math.ceil(misplacedCorners / 4); // Rough estimate
}

function edgeHeuristic(cube: CubeState): number {
  let misplacedEdges = 0;
  
  // Check all 12 edges
  const edges = [
    // Edge positions: [face, row, col] for each sticker of the edge
    [[0, 0, 1], [5, 0, 1]], // Top-back
    [[0, 1, 0], [4, 0, 1]], // Top-left
    [[0, 1, 2], [1, 0, 1]], // Top-right
    [[0, 2, 1], [2, 0, 1]], // Top-front
    [[1, 1, 0], [5, 1, 2]], // Right-back
    [[1, 1, 2], [2, 1, 2]], // Right-front
    [[1, 2, 1], [3, 0, 1]], // Right-bottom
    [[2, 1, 0], [4, 1, 2]], // Front-left
    [[2, 2, 1], [3, 1, 1]], // Front-bottom
    [[3, 1, 0], [4, 2, 1]], // Bottom-left
    [[3, 1, 2], [1, 2, 1]], // Bottom-right
    [[3, 2, 1], [5, 2, 1]]  // Bottom-back
  ];
  
  for (const edge of edges) {
    const colors = edge.map(([face, row, col]) => cube[face][row][col]);
    if (!isEdgeInCorrectPosition(colors, edge)) {
      misplacedEdges++;
    }
  }
  
  return Math.ceil(misplacedEdges / 4); // Rough estimate
}

function getTargetColor(face: number): string {
  const colors = ['white', 'red', 'green', 'yellow', 'orange', 'blue'];
  return colors[face];
}

function isCornerInCorrectPosition(colors: string[], positions: number[][]): boolean {
  // Simplified check - in a real implementation, this would be more complex
  const targetColors = positions.map(([face]) => getTargetColor(face));
  return colors.every(color => targetColors.includes(color));
}

function isEdgeInCorrectPosition(colors: string[], positions: number[][]): boolean {
  // Simplified check - in a real implementation, this would be more complex
  const targetColors = positions.map(([face]) => getTargetColor(face));
  return colors.every(color => targetColors.includes(color));
}