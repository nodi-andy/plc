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
    Serial.printf("[Map::addNode]: %s\n", type.c_str());

    Node* newNode = RegistryManager::getInstance().createNode(type);
    if (newNode != nullptr) {
        newNode->setProps(json["properties"]);
        if (json.containsKey("nodeID")) {
            newNode->id = json["nodeID"].as<int>();
        } else {
            newNode->id = this->nodes.size();
        }
        newNode->posX = json["widget"]["pos"][0].as<int>();
        newNode->posY = json["widget"]["pos"][1].as<int>();
        newNode->type = json["type"].as<string>();
        addNode(newNode->id, newNode);
        Serial.printf("[Map:addNode:done] id: %d,  desc: %s, type: %s\n", newNode->id, newNode->desc.c_str(), newNode->getType().c_str());
    }
    return newNode;
}


Link* Map::addLink(int fromNode, string fromOutput, int toNode, string toOutput, int *linkID) {
    Link* link = new Link(nodes[fromNode], fromOutput, nodes[toNode], toOutput);

    if (linkID)
        link->id = *linkID;
    else
        link->id = this->links.size();;
        
    links[link->id] = link;
    link->setup();
    Serial.printf("[addLink] : linkID = %d  From: %d.%s To:%d.%s\n", linkID, fromNode, fromOutput.c_str(), toNode, toOutput.c_str());
    return link;
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
    StaticJsonDocument<8000> doc;
    JsonObject map = doc.to<JsonObject>();

    JsonArray jsNodes = map.createNestedArray("nodes");
    Serial.println("[Map::toJSON]:");
    for (auto n : nodes) {
        Serial.printf("\tnodes: %d\n", n.second->id);

       JsonObject nodeObject = jsNodes.createNestedObject();
       nodeObject["id"] = n.second->id;
       nodeObject["type"] = n.second->type;
       nodeObject["properties"] = n.second->getProps();
       nodeObject["posX"] = n.second->posX;
       nodeObject["posY"] = n.second->posY;
    }

    JsonArray jsLinks = map.createNestedArray("links");
    for (auto link : links) {
      Serial.printf("\tlinks: %d\n", link.second->id);
      JsonObject linkObject = jsLinks.createNestedObject();
      linkObject["id"] = link.second->id;
      linkObject["from"] = link.second->from->id;
      linkObject["src"] = link.second->src;
      linkObject["to"] = link.second->to->id;
      linkObject["dst"] = link.second->dst;
    }
    string ret;
    serializeJson(doc, ret);
    return ret;
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