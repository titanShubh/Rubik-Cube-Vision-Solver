#include <bits/stdc++.h>
using namespace std;

typedef vector<vector<vector<char>>> CubeState;
vector<string> MOVES = {"R","R'","R2","L","L'","L2","U","U'","U2","D","D'","D2","F","F'","F2","B","B'","B2"};

class RubiksCube {
private:
    CubeState cube;
    void rotateFaceClockwise(int f) {
        auto& face = cube[f];
        auto t = face;
        for(int i=0;i<3;i++) for(int j=0;j<3;j++) face[j][2-i] = t[i][j];
    }
    void rotateFaceCounter(int f) {
        rotateFaceClockwise(f);
        rotateFaceClockwise(f);
        rotateFaceClockwise(f);
    }

public:
    RubiksCube() {
        cube.resize(6, vector<vector<char>>(3, vector<char>(3)));
        string cols = "wrgyob";
        for(int f=0;f<6;f++) for(int i=0;i<3;i++) for(int j=0;j<3;j++) cube[f][i][j] = cols[f];
    }

    void applyRightMove() {
        rotateFaceClockwise(1);
        vector<char> t={cube[0][0][2],cube[0][1][2],cube[0][2][2]};
        for(int i=0;i<3;i++) cube[0][i][2] = cube[2][i][2];
        for(int i=0;i<3;i++) cube[2][i][2] = cube[3][i][2];
        cube[3][0][2]=cube[5][2][0]; cube[3][1][2]=cube[5][1][0]; cube[3][2][2]=cube[5][0][0];
        cube[5][2][0]=t[0]; cube[5][1][0]=t[1]; cube[5][0][0]=t[2];
    }
    void applyLeftMove() { rotateFaceClockwise(4); }
    void applyUpMove() { rotateFaceClockwise(0); }
    void applyDownMove() { rotateFaceClockwise(3); }
    void applyFrontMove() { rotateFaceClockwise(2); }
    void applyBackMove() { rotateFaceClockwise(5); }

    void applyMove(const string& m) {
        if(m=="R") applyRightMove();
        else if(m=="R'") applyRightMove(),applyRightMove(),applyRightMove();
        else if(m=="R2") applyRightMove(),applyRightMove();
        else if(m=="L") applyLeftMove();
        else if(m=="L'") applyLeftMove(),applyLeftMove(),applyLeftMove();
        else if(m=="L2") applyLeftMove(),applyLeftMove();
        else if(m=="U") applyUpMove();
        else if(m=="U'") applyUpMove(),applyUpMove(),applyUpMove();
        else if(m=="U2") applyUpMove(),applyUpMove();
        else if(m=="D") applyDownMove();
        else if(m=="D'") applyDownMove(),applyDownMove(),applyDownMove();
        else if(m=="D2") applyDownMove(),applyDownMove();
        else if(m=="F") applyFrontMove();
        else if(m=="F'") applyFrontMove(),applyFrontMove(),applyFrontMove();
        else if(m=="F2") applyFrontMove(),applyFrontMove();
        else if(m=="B") applyBackMove();
        else if(m=="B'") applyBackMove(),applyBackMove(),applyBackMove();
        else if(m=="B2") applyBackMove(),applyBackMove();
    }

    bool isSolved() const {
        for(int f=0;f<6;f++){
            char c=cube[f][0][0];
            for(int i=0;i<3;i++) for(int j=0;j<3;j++) if(cube[f][i][j]!=c) return false;
        }
        return true;
    }

    string toString() const {
        string s;
        for(auto& face: cube) for(auto& row: face) for(char c: row) s+=c;
        return s;
    }

    int heuristic() const {
        int cnt=0;
        for(int f=0;f<6;f++){
            char goal = cube[f][1][1];
            for(int i=0;i<3;i++) for(int j=0;j<3;j++) if(cube[f][i][j]!=goal) cnt++;
        }
        return (cnt+7)/8;
    }
};

class IDAStar {
private:
    int nodes;
    pair<bool, int> dfs(RubiksCube cube, vector<string>& path, int g, int thres, unordered_set<string>& vis) {
        nodes++;
        string key = cube.toString();
        if(vis.count(key)) return {false, INT_MAX};
        int h = cube.heuristic();
        int f = g + h;
        if(f > thres) return {false, f};
        if(cube.isSolved()) return {true, thres};
        vis.insert(key);
        int minT = INT_MAX;
        for(auto& move : MOVES) {
            RubiksCube next = cube;
            next.applyMove(move);
            path.push_back(move);
            auto res = dfs(next, path, g+1, thres, vis);
            if(res.first) return res;
            minT = min(minT, res.second);
            path.pop_back();
        }
        vis.erase(key);
        return {false, minT};
    }

public:
    vector<string> solve(RubiksCube cube, int maxD = 12) {
        nodes = 0;
        int thres = cube.heuristic();
        vector<string> path;
        while(thres <= maxD) {
            unordered_set<string> vis;
            auto res = dfs(cube, path, 0, thres, vis);
            if(res.first) {
                cout << "IDA* Solution found!\nMoves: " << path.size() << "\nNodes: " << nodes << endl;
                return path;
            }
            thres = res.second;
            path.clear();
        }
        cout << "IDA* No solution found\n";
        return {};
    }
};

class KociembaAlgorithm {
public:
    vector<string> solve(RubiksCube cube) {
        IDAStar ida;
        vector<string> phase1 = ida.solve(cube, 8);
        for(const auto& move : phase1) cube.applyMove(move);
        vector<string> phase2 = ida.solve(cube, 14);
        vector<string> solution = phase1;
        solution.insert(solution.end(), phase2.begin(), phase2.end());
        cout << "Kociemba Solution found!\nPhase 1: " << phase1.size() << "\nPhase 2: " << phase2.size() << "\nTotal: " << solution.size() << endl;
        return solution;
    }
};

int main() {
    RubiksCube cube;
    vector<string> scramble = {"R", "U", "R'", "F", "R", "F'"};

    cout << "Applying scramble: ";
    for (const string& move : scramble) {
        cout << move << " ";
        cube.applyMove(move);
    }
    cout << endl << endl;

    cout << "=== Testing Algorithms ===" << endl << endl;

    IDAStar ida;
    vector<string> idaSolution = ida.solve(cube);
    cout << "IDA* Solution: ";
    for (const string& move : idaSolution) cout << move << " ";
    cout << endl << endl;

    KociembaAlgorithm kociemba;
    vector<string> kociembaSolution = kociemba.solve(cube);
    cout << "Kociemba Solution: ";
    for (const string& move : kociembaSolution) cout << move << " ";
    cout << endl << endl;

    return 0;
}
