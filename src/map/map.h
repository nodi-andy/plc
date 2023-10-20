#include <unordered_map>
#include <queue>
#include <ArduinoJson.h>
#include "node.h"
#include "../nodes/link.h"
#include <set>

using namespace std;

class Map {
    public:
    Map();
    ~Map();
    unordered_map<int, Node*> nodes;
    unordered_map<int, Node*> links;
    queue<string> orders;

    void addNode(int id, Node* newNode);
    void addNode(JsonObject json);
    void addLink(int linkName, int fromNode, std::string fromOutput, int toNode, std::string toOutput);
    void addLinkToList(int id, Node* newNode);
    void clear();
    void report();
    string toJSON();

    int getID();
    void removeID(int idToRemove);

    private:
    int nextID;
    std::set<int> usedIDs;
};