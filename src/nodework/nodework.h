#include <unordered_map>
#include <queue>
#include <ArduinoJson.h>
#include <set>

#include "node.h"
#include "enums.h"

#define JSON_NODE_ID "nodeID"
using namespace std;

class Map
{
public:
    Map();
    ~Map();
    unordered_map<int, Node *> nodes;
    std::map<pair<int, int>, Node *> nodesByPos;

    void addNode(int id, Node *newNode);
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
    void setNodeOnGrid(int x, int y, Node*);
    void removeNodeOnGrid(int x, int y);
    void updateNBs(int x, int y);

    private:
    queue<string> orders;
    int nextID;
    set<int> usedIDs;
};