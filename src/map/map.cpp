#include <unordered_map>
#include "map.h"

Map::~Map()
{
    clear();
}

void Map::addNode(int id, Node* newNode)
{
    if (newNode) {
        nodes[id] = newNode;
        newNode->setup();
        Serial.print("> Node added: ");
        Serial.print(" ID : ");
        Serial.print(id);
        Serial.print(" Type : ");
        Serial.println(newNode->getType().c_str());
    }
}

void Map::addNode(JsonObject json)
{
    std::string type = json["type"].as<const char*>();
    Serial.println("");
    Serial.print("> Parse JSON: ");
    Serial.print("ID: ");
    Serial.print(json["id"].as<int>());
    Serial.print(" : ");
    Serial.println(type.c_str());

    Node* newNode = RegistryManager::getInstance().createNode(type);
    if (newNode != nullptr) {
        newNode->props = json;
        newNode->id = json["id"].as<int>();
        addNode(newNode->id, newNode);
        Serial.print("> New node: ");
        Serial.print(newNode->id);
        Serial.print(" : ");
        Serial.print(newNode->desc.c_str());
        Serial.print(" : ");
        Serial.print(newNode->getType().c_str());
    }
}

void Map::addLinkToList(int id, Node* newNode)
{
    links[id] = newNode;
    newNode->setup();
    Serial.println("> Link added");
}

void Map::addLink(int linkID, int fromNode, int fromOutput, int toNode, int toOutput)
{
    Serial.print("> New link: ");
    Serial.print(linkID);
    Serial.print(" From:");
    Serial.print(fromNode);
    Serial.print(" Port:");
    Serial.print(fromOutput);
    Serial.print(" To:");
    Serial.print(toNode);
    Serial.print(" Port:");
    Serial.print(toOutput);
    Link* link = new Link(nodes[fromNode], fromOutput, nodes[toNode], toOutput);
    addLinkToList(linkID, link);
}

void Map::clear()
{
    nodes.clear();
    links.clear();
    Serial.println("> All cleared");
}

void Map::report() {
    Serial.println("");
    Serial.println(">>>>>>>");
    Serial.println("NODES:");
    for (auto n : nodes) {
      Serial.print(n.first);
      Serial.print(" : ");
      Serial.println(n.second->getType().c_str());
    }
    Serial.println("LINKS:");
    for (auto n : links) {
      Serial.print(n.first);
      Serial.print(" : ");
      Serial.println(n.second->getType().c_str());
    }
    Serial.println(">>>>>>>");
    Serial.println("");
}