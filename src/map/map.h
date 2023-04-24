#include <unordered_map>
#include <ArduinoJson.h>
#include "node.h"
#include "../nodes/link.h"

enum mapState { RUN, STOP, UPDATE }; 
class Map
{
    public:
    ~Map();
    std::unordered_map<int, Node*> nodes;
    std::unordered_map<int, Node*> links;
    mapState state = mapState::STOP;

    void addNode(int id, Node* newNode);
    void addNode(JsonObject json);
    void addLink(int linkName, int fromNode, std::string fromOutput, int toNode, std::string toOutput);
    void addLinkToList(int id, Node* newNode);
    void clear();
    void report();
};