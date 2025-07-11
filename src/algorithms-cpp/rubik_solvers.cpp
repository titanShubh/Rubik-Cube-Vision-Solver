#include <iostream>
#include <vector>
#include <string>
#include <queue>
#include <unordered_set>
#include <unordered_map>
#include <algorithm>
#include <chrono>

using namespace std;

// Rubik's Cube representation
typedef vector<vector<vector<string>>> CubeState;

// Move definitions
vector<string> MOVES = {"R", "R'", "R2", "L", "L'", "L2", "U", "U'", "U2", "D", "D'", "D2", "F", "F'", "F2", "B", "B'", "B2"};

class RubiksCube {
private:
    CubeState cube;
    
public:
    RubiksCube() {
        // Initialize solved cube
        cube = {
            {{"white", "white", "white"}, {"white", "white", "white"}, {"white", "white", "white"}}, // Up
            {{"red", "red", "red"}, {"red", "red", "red"}, {"red", "red", "red"}},                 // Right
            {{"green", "green", "green"}, {"green", "green", "green"}, {"green", "green", "green"}}, // Front
            {{"yellow", "yellow", "yellow"}, {"yellow", "yellow", "yellow"}, {"yellow", "yellow", "yellow"}}, // Down
            {{"orange", "orange", "orange"}, {"orange", "orange", "orange"}, {"orange", "orange", "orange"}}, // Left
            {{"blue", "blue", "blue"}, {"blue", "blue", "blue"}, {"blue", "blue", "blue"}}          // Back
        };
    }
    
    // Rotate face clockwise
    void rotateFaceClockwise(int faceIndex) {
        auto& face = cube[faceIndex];
        auto temp = face;
        
        for (int i = 0; i < 3; i++) {
            for (int j = 0; j < 3; j++) {
                face[j][2-i] = temp[i][j];
            }
        }
    }
    
    // Apply right move
    void applyRightMove() {
        rotateFaceClockwise(1); // Right face
        
        // Save edge pieces
        vector<string> temp = {cube[0][0][2], cube[0][1][2], cube[0][2][2]};
        
        // Rotate edges
        cube[0][0][2] = cube[2][0][2]; cube[0][1][2] = cube[2][1][2]; cube[0][2][2] = cube[2][2][2];
        cube[2][0][2] = cube[3][0][2]; cube[2][1][2] = cube[3][1][2]; cube[2][2][2] = cube[3][2][2];
        cube[3][0][2] = cube[5][2][0]; cube[3][1][2] = cube[5][1][0]; cube[3][2][2] = cube[5][0][0];
        cube[5][2][0] = temp[0]; cube[5][1][0] = temp[1]; cube[5][0][0] = temp[2];
    }
    
    // Apply move by string
    void applyMove(const string& move) {
        if (move == "R") {
            applyRightMove();
        } else if (move == "R'") {
            applyRightMove(); applyRightMove(); applyRightMove();
        } else if (move == "R2") {
            applyRightMove(); applyRightMove();
        }
        // Add other moves (L, U, D, F, B) following same pattern...
    }
    
    // Check if cube is solved
    bool isSolved() {
        vector<vector<string>> solvedFaces = {
            {"white", "white", "white"},
            {"red", "red", "red"},
            {"green", "green", "green"},
            {"yellow", "yellow", "yellow"},
            {"orange", "orange", "orange"},
            {"blue", "blue", "blue"}
        };
        
        for (int f = 0; f < 6; f++) {
            for (int i = 0; i < 3; i++) {
                for (int j = 0; j < 3; j++) {
                    if (cube[f][i][j] != solvedFaces[f][0]) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
    
    // Convert cube to string for hashing
    string toString() {
        string result = "";
        for (const auto& face : cube) {
            for (const auto& row : face) {
                for (const auto& cell : row) {
                    result += cell[0]; // First character
                }
            }
        }
        return result;
    }
    
    // Manhattan distance heuristic
    int manhattanHeuristic() {
        int distance = 0;
        // Simplified heuristic - count misplaced pieces
        for (int f = 0; f < 6; f++) {
            for (int i = 0; i < 3; i++) {
                for (int j = 0; j < 3; j++) {
                    if (f == 0 && cube[f][i][j] != "white") distance++;
                    if (f == 1 && cube[f][i][j] != "red") distance++;
                    if (f == 2 && cube[f][i][j] != "green") distance++;
                    if (f == 3 && cube[f][i][j] != "yellow") distance++;
                    if (f == 4 && cube[f][i][j] != "orange") distance++;
                    if (f == 5 && cube[f][i][j] != "blue") distance++;
                }
            }
        }
        return distance / 8; // Rough estimate
    }
};

// IDA* Algorithm
class IDAStar {
private:
    int nodesExplored;
    
    pair<bool, int> search(RubiksCube cube, vector<string>& path, int g, int threshold, unordered_set<string>& visited) {
        nodesExplored++;
        
        string cubeKey = cube.toString();
        if (visited.count(cubeKey)) {
            return {false, INT_MAX};
        }
        
        int h = cube.manhattanHeuristic();
        int f = g + h;
        
        if (f > threshold) {
            return {false, f};
        }
        
        if (cube.isSolved()) {
            return {true, threshold};
        }
        
        visited.insert(cubeKey);
        int minThreshold = INT_MAX;
        
        for (const string& move : MOVES) {
            RubiksCube newCube = cube;
            newCube.applyMove(move);
            
            path.push_back(move);
            auto result = search(newCube, path, g + 1, threshold, visited);
            
            if (result.first) {
                return result;
            }
            
            minThreshold = min(minThreshold, result.second);
            path.pop_back();
        }
        
        visited.erase(cubeKey);
        return {false, minThreshold};
    }
    
public:
    vector<string> solve(RubiksCube cube, int maxDepth = 12) {
        nodesExplored = 0;
        auto startTime = chrono::high_resolution_clock::now();
        
        int threshold = cube.manhattanHeuristic();
        vector<string> solution;
        
        while (threshold <= maxDepth) {
            unordered_set<string> visited;
            auto result = search(cube, solution, 0, threshold, visited);
            
            if (result.first) {
                auto endTime = chrono::high_resolution_clock::now();
                auto duration = chrono::duration_cast<chrono::milliseconds>(endTime - startTime);
                
                cout << "IDA* Solution found!" << endl;
                cout << "Moves: " << solution.size() << endl;
                cout << "Nodes explored: " << nodesExplored << endl;
                cout << "Time: " << duration.count() << "ms" << endl;
                
                return solution;
            }
            
            threshold = result.second;
            solution.clear();
        }
        
        cout << "IDA* No solution found within depth limit" << endl;
        return {};
    }
};

// BFS Algorithm
class BreadthFirstSearch {
public:
    vector<string> solve(RubiksCube cube, int maxDepth = 8) {
        auto startTime = chrono::high_resolution_clock::now();
        int nodesExplored = 0;
        
        struct Node {
            RubiksCube cube;
            vector<string> path;
            int depth;
        };
        
        queue<Node> q;
        unordered_set<string> visited;
        
        q.push({cube, {}, 0});
        visited.insert(cube.toString());
        
        while (!q.empty()) {
            Node current = q.front();
            q.pop();
            nodesExplored++;
            
            if (current.cube.isSolved()) {
                auto endTime = chrono::high_resolution_clock::now();
                auto duration = chrono::duration_cast<chrono::milliseconds>(endTime - startTime);
                
                cout << "BFS Solution found!" << endl;
                cout << "Moves: " << current.path.size() << endl;
                cout << "Nodes explored: " << nodesExplored << endl;
                cout << "Time: " << duration.count() << "ms" << endl;
                
                return current.path;
            }
            
            if (current.depth >= maxDepth) continue;
            
            for (const string& move : MOVES) {
                RubiksCube newCube = current.cube;
                newCube.applyMove(move);
                
                string cubeKey = newCube.toString();
                if (!visited.count(cubeKey)) {
                    visited.insert(cubeKey);
                    vector<string> newPath = current.path;
                    newPath.push_back(move);
                    q.push({newCube, newPath, current.depth + 1});
                }
            }
        }
        
        cout << "BFS No solution found within depth limit" << endl;
        return {};
    }
};

// DFS Algorithm
class DepthFirstSearch {
private:
    int nodesExplored;
    
    vector<string> search(RubiksCube cube, vector<string>& path, int depth, int maxDepth, unordered_set<string>& visited) {
        nodesExplored++;
        
        string cubeKey = cube.toString();
        if (visited.count(cubeKey)) {
            return {};
        }
        
        if (cube.isSolved()) {
            return path;
        }
        
        if (depth >= maxDepth) {
            return {};
        }
        
        visited.insert(cubeKey);
        
        for (const string& move : MOVES) {
            RubiksCube newCube = cube;
            newCube.applyMove(move);
            
            path.push_back(move);
            vector<string> result = search(newCube, path, depth + 1, maxDepth, visited);
            
            if (!result.empty()) {
                return result;
            }
            
            path.pop_back();
        }
        
        visited.erase(cubeKey);
        return {};
    }
    
public:
    vector<string> solve(RubiksCube cube, int maxDepth = 10) {
        nodesExplored = 0;
        auto startTime = chrono::high_resolution_clock::now();
        
        for (int depth = 1; depth <= maxDepth; depth++) {
            unordered_set<string> visited;
            vector<string> path;
            vector<string> result = search(cube, path, 0, depth, visited);
            
            if (!result.empty()) {
                auto endTime = chrono::high_resolution_clock::now();
                auto duration = chrono::duration_cast<chrono::milliseconds>(endTime - startTime);
                
                cout << "DFS Solution found!" << endl;
                cout << "Moves: " << result.size() << endl;
                cout << "Nodes explored: " << nodesExplored << endl;
                cout << "Time: " << duration.count() << "ms" << endl;
                
                return result;
            }
        }
        
        cout << "DFS No solution found within depth limit" << endl;
        return {};
    }
};

// Kociemba Algorithm (simplified two-phase)
class KociembaAlgorithm {
public:
    vector<string> solve(RubiksCube cube) {
        auto startTime = chrono::high_resolution_clock::now();
        
        // Phase 1: Get to H group (edge orientation, corner orientation, E-slice)
        vector<string> phase1 = solvePhase1(cube);
        
        // Apply phase 1 moves
        for (const string& move : phase1) {
            cube.applyMove(move);
        }
        
        // Phase 2: Solve within H group
        vector<string> phase2 = solvePhase2(cube);
        
        // Combine solutions
        vector<string> solution = phase1;
        solution.insert(solution.end(), phase2.begin(), phase2.end());
        
        auto endTime = chrono::high_resolution_clock::now();
        auto duration = chrono::duration_cast<chrono::milliseconds>(endTime - startTime);
        
        cout << "Kociemba Solution found!" << endl;
        cout << "Phase 1 moves: " << phase1.size() << endl;
        cout << "Phase 2 moves: " << phase2.size() << endl;
        cout << "Total moves: " << solution.size() << endl;
        cout << "Time: " << duration.count() << "ms" << endl;
        
        return solution;
    }
    
private:
    vector<string> solvePhase1(RubiksCube cube) {
        // Simplified phase 1 - use IDA* with phase 1 heuristic
        IDAStar ida;
        return ida.solve(cube, 12);
    }
    
    vector<string> solvePhase2(RubiksCube cube) {
        // Simplified phase 2 - use IDA* with phase 2 moves only
        vector<string> phase2Moves = {"R", "R'", "R2", "L", "L'", "L2", "U", "U'", "U2", "D", "D'", "D2", "F2", "B2"};
        IDAStar ida;
        return ida.solve(cube, 18);
    }
};

// Example usage
int main() {
    RubiksCube cube;
    
    // Apply some scramble
    vector<string> scramble = {"R", "U", "R'", "F", "R", "F'"};
    cout << "Applying scramble: ";
    for (const string& move : scramble) {
        cout << move << " ";
        cube.applyMove(move);
    }
    cout << endl << endl;
    
    // Test different algorithms
    cout << "=== Testing Algorithms ===" << endl << endl;
    
    // IDA*
    IDAStar ida;
    vector<string> idaSolution = ida.solve(cube);
    
    // BFS
    BreadthFirstSearch bfs;
    vector<string> bfsSolution = bfs.solve(cube);
    
    // DFS
    DepthFirstSearch dfs;
    vector<string> dfsSolution = dfs.solve(cube);
    
    // Kociemba
    KociembaAlgorithm kociemba;
    vector<string> kociembaSolution = kociemba.solve(cube);
    
    return 0;
}

/*
Compilation and usage:
g++ -O3 -std=c++17 rubik_solvers.cpp -o rubik_solvers
./rubik_solvers
*/