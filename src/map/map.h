#include <unordered_map>
#include <queue>
#include <ArduinoJson.h>
#include "node.h"
#include <set>
#define JSON_NODE_ID "nodeID"
using namespace std;

class Map {
    public:
    Map();
    ~Map();
    unordered_map<int, Node*> nodes;
    queue<string> orders;

    void addNode(int id, Node* newNode);
    Node* addNode(JsonObject json);
    void removeNode(int idToRemove);


    void clear();
    void report();
    DynamicJsonDocument toJSON();

    int getID();
    void removeID(int idToRemove);

    private:
    int nextID;
    std::set<int> usedIDs;
};