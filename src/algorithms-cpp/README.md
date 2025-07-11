# Rubik's Cube Solver Algorithms in C++

This directory contains high-performance C++ implementations of the Rubik's cube solving algorithms.

## Compilation

```bash
g++ -O3 -std=c++17 rubik_solvers.cpp -o rubik_solvers
```

## Usage

```bash
./rubik_solvers
```

## Algorithms Implemented

1. **IDA* (Iterative Deepening A*)** - Korf's optimal algorithm
2. **BFS (Breadth-First Search)** - Guaranteed shortest solution
3. **DFS (Depth-First Search)** - Memory efficient with iterative deepening
4. **Kociemba Two-Phase Algorithm** - Professional speedcubing algorithm

## Features

- Full 3x3x3 Rubik's cube representation
- All 18 basic moves (R, R', R2, L, L', L2, etc.)
- Manhattan distance heuristic
- Performance metrics (time, nodes explored)
- Memory-efficient implementations
- Optimized for speed with O3 compilation

## Performance

The C++ versions are significantly faster than JavaScript implementations and can handle deeper search depths efficiently.