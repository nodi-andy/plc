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

Node* Map::addNode(JsonObject json)
{
    string type = json["type"].as<std::string>();
    Serial.printf("[Map::addNode:json]: %s\n", type.c_str());

    Node* newNode = RegistryManager::getInstance().createNode(type);
    if (newNode != nullptr) {
        newNode->setProps(json["node"]["properties"]);
        if (json.containsKey(JSON_NODE_ID)) {
            newNode->id = json[JSON_NODE_ID].as<int>();
        } else {
            newNode->id = this->nodes.size();
        }
        newNode->pos[0] = json["pos"][0].as<int>();
        newNode->pos[1] = json["pos"][1].as<int>();
        newNode->type = json["type"].as<string>();
        addNode(newNode->id, newNode);
        Serial.printf("[Map:addNode:done] id: %d,  desc: %s, type: %s\n", newNode->id, newNode->desc.c_str(), newNode->getType().c_str());
    }
    return newNode;
}


void Map::clear()
{
    nodes.clear();
    usedIDs.clear();
    nextID = 0;
    Serial.println("[Map::clear]");
}

DynamicJsonDocument Map::toJSON() {
    DynamicJsonDocument doc(8000);
    JsonObject map = doc.to<JsonObject>();

    JsonArray jsNodes = map.createNestedArray("nodes");
    Serial.println("[Map::toJSON]:");
    for (auto n : nodes) {
        Serial.printf("\tnodes: %d\n", n.second->id);

       JsonObject nodeObject = jsNodes.createNestedObject();
       nodeObject["nodeID"] = n.second->id;
       nodeObject["type"] = n.second->type;
       nodeObject["properties"] = n.second->getProps();
       JsonArray posArray = nodeObject.createNestedArray("pos");
       posArray[0] = n.second->pos[0];
       posArray[1] = n.second->pos[1];
    }
    return doc;
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

void Map::removeNode(int idToRemove) {

    // Erase the node from the nodes map
    nodes.erase(idToRemove);

    // Remove ID from usedIDs set
    removeID(idToRemove);
}