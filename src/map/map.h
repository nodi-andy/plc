#include <unordered_map>
#include <queue>
#include <ArduinoJson.h>
#include "node.h"
#include "../nodes/link.h"
#include <set>
#define JSON_NODE_ID "nodeID"
using namespace std;

class Map {
    public:
    Map();
    ~Map();
    unordered_map<int, Node*> nodes;
    unordered_map<int, Link*> links;
    queue<string> orders;

    void addNode(int id, Node* newNode);
    Node* addNode(JsonObject json);
    void removeNode(int idToRemove);

    Link* addLink(int fromNode, string fromOutput, int toNode, string toOutput, int *linkID = nullptr);
    void removeLink(int linkIDToRemove);

    void clear();
    void report();
    DynamicJsonDocument toJSON();

    int getID();
    void removeID(int idToRemove);

    private:
    int nextID;
    std::set<int> usedIDs;
};