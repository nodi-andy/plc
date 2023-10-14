#include <unordered_map>
#include <queue>
#include <ArduinoJson.h>
#include "node.h"
#include "../nodes/link.h"

using namespace std;

enum mapState { ID, RUN, STOP, STOPPED, UPDATE, UPDATE_NODE, ADD_NODE, REM_NODE, ADD_LINK, REM_LINK }; 
class Map
{
    public:
    ~Map();
    unordered_map<int, Node*> nodes;
    unordered_map<int, Node*> links;
    queue<string> orders;
    mapState state = mapState::STOP;

    void addNode(int id, Node* newNode);
    void addNode(JsonObject json);
    void addLink(int linkName, int fromNode, std::string fromOutput, int toNode, std::string toOutput);
    void addLinkToList(int id, Node* newNode);
    void clear();
    void report();
};