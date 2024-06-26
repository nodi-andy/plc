#include <unordered_map>
#include <queue>
#include <ArduinoJson.h>
#include <set>

#include "node.h"
#include "enums.h"

#define JSON_NODE_ID "nodeID"
#define defaultFileName  "/map.json"

using namespace std;

class Map
{
public:
    Map();
    ~Map();
    unordered_map<int, Node *> nodes;
    std::map<pair<int, int>, int> nodesByPos;

    void addNode(int x, int y, Node *newNode);
    void addNode(Node *newNode);
    Node *addNode(JsonObject json);
    void removeNode(int idToRemove);

    void cmd(string msg);
    void sendToSocket(string key, const JsonObject& msg);
    int (*socket)(string msg);

    vector<string> run();

    void clear();
    void report();
    JsonDocument toJSON();

    int getID();
    void removeID(int idToRemove);

    void updateInputs(JsonObject msg);
    Node* getNodeById(int id);
    Node* getNodeOnGrid(int x, int y);
    int* getNodeIDOnGrid(int x, int y);
    void setNodeOnGrid(int x, int y, int id);
    void removeFromMemory(int x, int y);
    bool removeNodeOnGrid(int x, int y, bool update = false);
    int getNumberOfNodes(int id);
    void rotateNode(int x, int y);
    void updateNBs(int x, int y);

    private:
    queue<string> orders;
    int nextID;
    set<int> usedIDs;
};