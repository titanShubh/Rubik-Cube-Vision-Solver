#include <iostream>
#include <vector>
#include <unordered_map>
#include <unordered_set>
#include <queue>
#include <string>
#include <algorithm>
#include <array>
using namespace std;

struct Cube {
    array<int, 8> cp;  // Corner permutation
    array<int, 8> co;  // Corner orientation
    array<int, 12> ep; // Edge permutation
    array<int, 12> eo; // Edge orientation

    Cube() {
        for (int i = 0; i < 8; ++i) cp[i] = i, co[i] = 0;
        for (int i = 0; i < 12; ++i) ep[i] = i, eo[i] = 0;
    }

    bool isSolved() const {
        for (int i = 0; i < 8; ++i)
            if (cp[i] != i || co[i] != 0) return false;
        for (int i = 0; i < 12; ++i)
            if (ep[i] != i || eo[i] != 0) return false;
        return true;
    }

    string key() const {
        string k;
        for (int x : cp) k += to_string(x);
        for (int x : co) k += to_string(x);
        for (int x : ep) k += to_string(x);
        for (int x : eo) k += to_string(x);
        return k;
    }

    bool operator==(const Cube& other) const {
        return cp == other.cp && co == other.co && ep == other.ep && eo == other.eo;
    }
};

// Basic hash function for unordered_set/map of Cube
namespace std {
    template <>
    struct hash<Cube> {
        size_t operator()(const Cube& c) const {
            return hash<string>()(c.key());
        }
    };
}

// Move table
unordered_map<string, Cube> moveTable;

// Helper to compose two cube states
Cube apply(const Cube& a, const Cube& move) {
    Cube res;
    for (int i = 0; i < 8; ++i) {
        res.cp[i] = a.cp[move.cp[i]];
        res.co[i] = (a.co[move.cp[i]] + move.co[i]) % 3;
    }
    for (int i = 0; i < 12; ++i) {
        res.ep[i] = a.ep[move.ep[i]];
        res.eo[i] = (a.eo[move.ep[i]] + move.eo[i]) % 2;
    }
    return res;
}

// Move definitions: U, D, L, R, F, B
void initMoves() {
    vector<string> faces = {"U", "D", "L", "R", "F", "B"};

    // Base moves from Korf's model
    unordered_map<string, Cube> base;
    Cube m;

    // U
    m.cp = {3, 0, 1, 2, 4, 5, 6, 7};
    m.co = {0, 0, 0, 0, 0, 0, 0, 0};
    m.ep = {3, 0, 1, 2, 4, 5, 6, 7, 8, 9, 10, 11};
    m.eo = {0};
    base["U"] = m;

    // D
    m.cp = {0, 1, 2, 3, 5, 6, 7, 4};
    m.ep = {0, 1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 8};
    base["D"] = m;

    // L
    m.cp = {4, 1, 2, 0, 7, 5, 6, 3};
    m.co = {1,0,0,2,2,0,0,1};
    base["L"] = m;

    // R
    m.cp = {0, 2, 6, 3, 4, 1, 5, 7};
    m.co = {0,1,2,0,0,2,1,0};
    base["R"] = m;

    // F
    m.cp = {0,1,3,7,4,5,2,6};
    m.co = {0,0,1,2,0,0,2,1};
    base["F"] = m;

    // B
    m.cp = {1,5,6,3,0,4,2,7};
    m.co = {2,1,0,0,1,2,0,0};
    base["B"] = m;

    // Generate all 18 moves
    for (auto& [face, m] : base) {
        Cube x = m;
        for (int i = 1; i <= 3; ++i) {
            string name = face + (i == 1 ? "" : (i == 2 ? "2" : "'"));
            moveTable[name] = x;
            x = apply(x, m); // Repeated applications
        }
    }
}

// Simple heuristic (number of misplaced corners/edges)
int heuristic(const Cube& c) {
    int h = 0;
    for (int i = 0; i < 8; ++i)
        if (c.cp[i] != i || c.co[i] != 0) h++;
    for (int i = 0; i < 12; ++i)
        if (c.ep[i] != i || c.eo[i] != 0) h++;
    return h / 8;  // Scaled down to keep f-cost tight
}

// IDA* search
bool dfs(Cube& node, int g, int bound, vector<string>& path, string lastMove, Cube& goal, int& nodes) {
    int f = g + heuristic(node);
    if (f > bound) return false;
    if (node == goal) return true;

    for (auto& [name, move] : moveTable) {
        if (!lastMove.empty() && name[0] == lastMove[0]) continue;
        Cube child = apply(node, move);
        path.push_back(name);
        nodes++;
        if (dfs(child, g + 1, bound, path, name, goal, nodes))
            return true;
        path.pop_back();
    }
    return false;
}

vector<string> idaStar(Cube start) {
    Cube goal;
    int bound = heuristic(start);
    vector<string> path;
    int nodes = 0;

    while (true) {
        if (dfs(start, 0, bound, path, "", goal, nodes)) {
            cout << "Solved in " << path.size() << " moves, expanded " << nodes << " nodes.\n";
            return path;
        }
        bound++;
        if (bound > 20) break; // Limit depth
    }
    return {};
}

// Main
int main() {
    initMoves();
    Cube cube;

    vector<string> scramble = {"U", "R", "F", "D", "L", "B"};
    for (auto& m : scramble) {
        cube = apply(cube, moveTable[m]);
    }

    cout << "Solving scramble: ";
    for (auto& m : scramble) cout << m << " ";
    cout << endl;

    auto solution = idaStar(cube);

    cout << "Solution: ";
    for (auto& move : solution) cout << move << " ";
    cout << endl;

    return 0;
}
