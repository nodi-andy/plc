#include <unordered_map>
#include "map.h"

Map::Map() {
    nextID = 0;
}
Map::~Map()
{
    clear();
}

void Map::addNode(int id, Node* newNode)
{
    if (newNode) {
        nodes[id] = newNode;
        Serial.printf("[Map::addNode] ID=%d type = %s \n", id, newNode->getType().c_str());
        newNode->setup();
    }
}

void Map::addNode(JsonObject json)
{
    string type = json["type"].as<std::string>();
    Serial.printf("[Map::addNode]: %s\n", type.c_str());

    Node* newNode = RegistryManager::getInstance().createNode(type);
    if (newNode != nullptr) {
        newNode->setProps(json["properties"]);
        if (json.containsKey("nodeID")) {
            newNode->id = json["nodeID"].as<int>();
        } else {
            newNode->id = this->nodes.size();
        }
        addNode(newNode->id, newNode);
        Serial.printf("[Map:addNode:done] id: %d,  desc: %s, type: %s\n", newNode->id, newNode->desc.c_str(), newNode->getType().c_str());
    }
}

void Map::addLinkToList(int id, Node* newNode)
{
    newNode->id = id;
    links[id] = newNode;
    Serial.printf("addLinkToList: %d\n", id);

    newNode->setup();
    Serial.println("> Link added");
}

void Map::addLink(int linkID, int fromNode, string fromOutput, int toNode, string toOutput)
{
    Serial.printf("[addLink] : linkID = %d  From: %d.%s To:%d.%s\n", linkID, fromNode, fromOutput.c_str(), toNode, toOutput.c_str());

    Link* link = new Link(nodes[fromNode], fromOutput, nodes[toNode], toOutput);
    addLinkToList(linkID, link);
}

void Map::clear()
{
    nodes.clear();
    links.clear();
    usedIDs.clear();
    nextID = 0;
    Serial.println("[Map::clear]");
}

string Map::toJSON() {
    StaticJsonDocument<1000> doc;
    JsonObject map = doc.to<JsonObject>();

    JsonArray jsNodes = map.createNestedArray("nodes");

    Serial.println("nodemap to json");
    for (auto n : nodes) {
       jsNodes[n.second->id] = jsNodes.createNestedObject();
       jsNodes[n.second->id]["properties"] = n.second->getProps();
    }
    /*JsonArray jsLinks = map.createNestedArray("links");

    for (auto n : links) {
       jsLinks[n.second->id] = n.second->getProps()
    }*/
}
void Map::report() {
    Serial.println("");
    Serial.println(">>>>>>>");
    Serial.println("NODES:");
    for (auto n : nodes) {
      Serial.print(n.first);
      Serial.print(" : ");
      if (n.second) {
        Serial.println(n.second->getType().c_str());
      }
    }
    Serial.println("LINKS:");
    for (auto n : links) {
      Serial.print(n.first);
      Serial.print(" : ");
      if (n.second) {
        Serial.println(n.second->getType().c_str());
      }
    }
    Serial.println(">>>>>>>");
    Serial.println("");
}

int Map::getID() {
    while (usedIDs.count(nextID)) {
        nextID++;
    }
    usedIDs.insert(nextID);
    return nextID;
}

void Map::removeID(int idToRemove) {
   usedIDs.erase(idToRemove);
}