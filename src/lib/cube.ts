// Rubik's Cube representation and basic operations
export type CubeFace = string[][];
export type CubeState = CubeFace[];

// Standard cube moves
export const MOVES = [
  'R', "R'", 'R2',  // Right face
  'L', "L'", 'L2',  // Left face  
  'U', "U'", 'U2',  // Up face
  'D', "D'", 'D2',  // Down face
  'F', "F'", 'F2',  // Front face
  'B', "B'", 'B2'   // Back face
] as const;

export type Move = typeof MOVES[number];

// Create a solved cube state
export function createSolvedCube(): CubeState {
  const colors = ['white', 'red', 'green', 'yellow', 'orange', 'blue'];
  return colors.map(color => 
    Array(3).fill(null).map(() => Array(3).fill(color))
  );
}

// Deep clone cube state
export function cloneCube(cube: CubeState): CubeState {
  return cube.map(face => face.map(row => [...row]));
}

// Rotate a face 90 degrees clockwise
function rotateFaceClockwise(face: CubeFace): CubeFace {
  const n = face.length;
  const rotated: CubeFace = Array(n).fill(null).map(() => Array(n).fill(''));
  
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      rotated[j][n - 1 - i] = face[i][j];
    }
  }
  
  return rotated;
}

// Apply a single move to the cube
export function applyMove(cube: CubeState, move: Move): CubeState {
  const newCube = cloneCube(cube);
  
  switch (move) {
    case 'R':
      return applyRightMove(newCube);
    case "R'":
      return applyRightMove(applyRightMove(applyRightMove(newCube)));
    case 'R2':
      return applyRightMove(applyRightMove(newCube));
    case 'L':
      return applyLeftMove(newCube);
    case "L'":
      return applyLeftMove(applyLeftMove(applyLeftMove(newCube)));
    case 'L2':
      return applyLeftMove(applyLeftMove(newCube));
    case 'U':
      return applyUpMove(newCube);
    case "U'":
      return applyUpMove(applyUpMove(applyUpMove(newCube)));
    case 'U2':
      return applyUpMove(applyUpMove(newCube));
    case 'D':
      return applyDownMove(newCube);
    case "D'":
      return applyDownMove(applyDownMove(applyDownMove(newCube)));
    case 'D2':
      return applyDownMove(applyDownMove(newCube));
    case 'F':
      return applyFrontMove(newCube);
    case "F'":
      return applyFrontMove(applyFrontMove(applyFrontMove(newCube)));
    case 'F2':
      return applyFrontMove(applyFrontMove(newCube));
    case 'B':
      return applyBackMove(newCube);
    case "B'":
      return applyBackMove(applyBackMove(applyBackMove(newCube)));
    case 'B2':
      return applyBackMove(applyBackMove(newCube));
    default:
      return newCube;
  }
}

// Individual move implementations
function applyRightMove(cube: CubeState): CubeState {
  // Rotate right face
  cube[1] = rotateFaceClockwise(cube[1]);
  
  // Move edge pieces
  const temp = [cube[0][0][2], cube[0][1][2], cube[0][2][2]];
  cube[0][0][2] = cube[2][0][2];
  cube[0][1][2] = cube[2][1][2];
  cube[0][2][2] = cube[2][2][2];
  
  cube[2][0][2] = cube[3][0][2];
  cube[2][1][2] = cube[3][1][2];
  cube[2][2][2] = cube[3][2][2];
  
  cube[3][0][2] = cube[5][2][0];
  cube[3][1][2] = cube[5][1][0];
  cube[3][2][2] = cube[5][0][0];
  
  cube[5][0][0] = temp[2];
  cube[5][1][0] = temp[1];
  cube[5][2][0] = temp[0];
  
  return cube;
}

function applyLeftMove(cube: CubeState): CubeState {
  // Rotate left face
  cube[4] = rotateFaceClockwise(cube[4]);
  
  // Move edge pieces
  const temp = [cube[0][0][0], cube[0][1][0], cube[0][2][0]];
  cube[0][0][0] = cube[5][2][2];
  cube[0][1][0] = cube[5][1][2];
  cube[0][2][0] = cube[5][0][2];
  
  cube[5][0][2] = temp[2];
  cube[5][1][2] = temp[1];
  cube[5][2][2] = temp[0];
  
  cube[5][0][2] = cube[3][0][0];
  cube[5][1][2] = cube[3][1][0];
  cube[5][2][2] = cube[3][2][0];
  
  cube[3][0][0] = cube[2][0][0];
  cube[3][1][0] = cube[2][1][0];
  cube[3][2][0] = cube[2][2][0];
  
  cube[2][0][0] = temp[0];
  cube[2][1][0] = temp[1];
  cube[2][2][0] = temp[2];
  
  return cube;
}

function applyUpMove(cube: CubeState): CubeState {
  // Rotate up face
  cube[0] = rotateFaceClockwise(cube[0]);
  
  // Move edge pieces
  const temp = [...cube[2][0]];
  cube[2][0] = [...cube[1][0]];
  cube[1][0] = [...cube[5][0]];
  cube[5][0] = [...cube[4][0]];
  cube[4][0] = [...temp];
  
  return cube;
}

function applyDownMove(cube: CubeState): CubeState {
  // Rotate down face
  cube[3] = rotateFaceClockwise(cube[3]);
  
  // Move edge pieces
  const temp = [...cube[2][2]];
  cube[2][2] = [...cube[4][2]];
  cube[4][2] = [...cube[5][2]];
  cube[5][2] = [...cube[1][2]];
  cube[1][2] = [...temp];
  
  return cube;
}

function applyFrontMove(cube: CubeState): CubeState {
  // Rotate front face
  cube[2] = rotateFaceClockwise(cube[2]);
  
  // Move edge pieces
  const temp = [...cube[0][2]];
  cube[0][2] = [cube[4][2][2], cube[4][1][2], cube[4][0][2]];
  
  cube[4][0][2] = cube[3][0][0];
  cube[4][1][2] = cube[3][0][1];
  cube[4][2][2] = cube[3][0][2];
  
  cube[3][0] = [cube[1][2][0], cube[1][1][0], cube[1][0][0]];
  
  cube[1][0][0] = temp[0];
  cube[1][1][0] = temp[1];
  cube[1][2][0] = temp[2];
  
  return cube;
}

function applyBackMove(cube: CubeState): CubeState {
  // Rotate back face
  cube[5] = rotateFaceClockwise(cube[5]);
  
  // Move edge pieces
  const temp = [...cube[0][0]];
  cube[0][0] = [cube[1][0][2], cube[1][1][2], cube[1][2][2]];
  
  cube[1][0][2] = cube[3][2][2];
  cube[1][1][2] = cube[3][2][1];
  cube[1][2][2] = cube[3][2][0];
  
  cube[3][2] = [cube[4][2][0], cube[4][1][0], cube[4][0][0]];
  
  cube[4][0][0] = temp[2];
  cube[4][1][0] = temp[1];
  cube[4][2][0] = temp[0];
  
  return cube;
}

// Check if cube is solved
export function isSolved(cube: CubeState): boolean {
  return cube.every(face => 
    face.every(row => 
      row.every(cell => cell === face[0][0])
    )
  );
}

// Convert cube state to string for hashing
export function cubeToString(cube: CubeState): string {
  return cube.map(face => 
    face.map(row => row.join('')).join('')
  ).join('');
}