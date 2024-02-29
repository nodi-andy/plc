#include <unordered_map>
#include "nodework.h"
#include <SPIFFS.h> 
#include <FS.h>

Map::Map()
{
    nextID = 0;
}

Map::~Map()
{
    clear();
}

void Map::cmd(string msg)
{
    orders.push(msg);
}

// add the node in nodelist
void Map::addNode(Node *newNode)
{
    if (newNode && nodes.count(newNode->id) == 0)
    {
        nodes[newNode->id] = newNode;
        Serial.printf("[Map::addNode] ID= %d type= %s n= %d\n", newNode->id, newNode->getType().c_str(), nodes.size());
        setNodeOnGrid(newNode->pos[0], newNode->pos[1], newNode);
        newNode->setup();
    }
}

// use json to create a node
Node *Map::addNode(JsonObject json)
{
    string type = json["type"].as<std::string>();

    Node *newNode = RegistryManager::getInstance().createNode(type);
    if (newNode != nullptr)
    {
        newNode->parent = this;
        newNode->setValues(json["node"]["properties"]);
        newNode->id = json["node"][JSON_NODE_ID].as<int>();
        newNode->pos[0] = json["pos"][0].as<int>();
        newNode->pos[1] = json["pos"][1].as<int>();
        newNode->type = type;
        Serial.printf("[Map:createNode:done] id: %d, type: %s\n", newNode->id, newNode->getType().c_str());
        addNode(newNode);
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

JsonDocument Map::toJSON()
{
    JsonDocument doc;
    JsonObject map = doc.to<JsonObject>();

    JsonArray jsNodes = map["nodes"].to<JsonArray>();
    Serial.println("[Map::toJSON]:");
    for (auto n : nodes)
    {
        if (n.second) {
            Serial.printf("[nodes: %d]\n", n.second->id);

            JsonObject nodeObject = jsNodes.add<JsonObject>();
            nodeObject["node"] = jsNodes.add<JsonObject>();
            nodeObject["node"]["nodeID"] = n.second->id;
            nodeObject["type"] = n.second->type;
            nodeObject["properties"] = jsNodes.add<JsonObject>();
            for (const auto& val : n.second->vals)
            {
                // Use val.first as the key, and the result of getValue(val.first) as the value.
                nodeObject["properties"][val.first] = n.second->getValue(val.first);
            }
            JsonArray posArray = nodeObject["pos"].to<JsonArray>();
            posArray[0] = n.second->pos[0];
            posArray[1] = n.second->pos[1];
        }
    }
    return doc;
}

void Map::report()
{
    Serial.printf("[Map::report] : %d\n", nodes.size());
    for (auto n : nodes)
    {
        Serial.print(n.first);
        Serial.print(" : ");
        if (n.second)
        {
            Serial.println(n.second->getType().c_str());
        }
    }

    Serial.println("");
}

int Map::getID()
{
    while (usedIDs.count(nextID))
    {
        nextID++;
    }
    usedIDs.insert(nextID);
    return nextID;
}

void Map::removeID(int idToRemove)
{
    usedIDs.erase(idToRemove);
}

void Map::removeNode(int idToRemove)
{
    // Erase the node from the nodes map
    nodes.erase(idToRemove);

    // Remove ID from usedIDs set
    removeID(idToRemove);
}

void Map::updateInputs(JsonObject msg)
{
    JsonObject properties = msg["properties"].as<JsonObject>();
    for (JsonPair p : properties)
    {
        nodes[msg["nodeID"]]->setInput(p.key().c_str(), 0, properties["key"].as<int>());
    }
}

Node *Map::getNodeById(int id)
{
    if (id > -1)
        return nodes[id];
    return NULL;
}

Node *Map::getNodeOnGrid(int x, int y)
{
    return nodesByPos[make_pair(x, y)];
}

void Map::removeNodeOnGrid(int x, int y)
{
    nodesByPos.erase(make_pair(x, y));
}

void Map::setNodeOnGrid(int x, int y, Node *node)
{
    nodesByPos[make_pair(x, y)] = node;
    updateNBs(x, y);
}

void Map::updateNBs(int x, int y)
{
    for (auto const &nb : NodiEnums::allVec)
    {
        Node *nbNode = getNodeOnGrid(x + nb.x, y + nb.y);
        if (nbNode)
        {
            nbNode->reconnect();
        }
    }
}

void Map::sendToSocket(string key, const JsonObject &msg)
{
    StaticJsonDocument<8000> sjsondoc;
    JsonArray arr = sjsondoc.to<JsonArray>();
    arr.add(key);
    arr.add(msg);

    String res;
    serializeJson(sjsondoc, res);
    if (socket)
    {
        socket(res.c_str());
    }
    // socketIO.sendEVENT(res.c_str());
    // websocket.textAll(res.c_str(), res.length());
}

vector<string> Map::run()
{
    if (orders.size())
    {
        DynamicJsonDocument djsondoc(4048);
        string order = orders.front();
        orders.pop();
        Serial.printf("[nodework:new_order] : %s\n", order.c_str());

        deserializeJson(djsondoc, order.c_str(), order.length());
        string eventName = djsondoc[0];
        JsonObject eventData = djsondoc[1];
        int id = eventData["nodeID"].as<int>();
        Serial.printf("[nodework:event] id: %d, name: %s\n", id, eventName.c_str());

        if (eventName == "getNodework")
        {
            // SERIAL.printf("[getMap] : %s\n", mapJSON.c_str());
            sendToSocket("setNodework", toJSON().as<JsonObject>());
        }
        else if (eventName == "clear")
        {
            clear();
        } else if (eventName == "save") {
            String mapJSON = toJSON().as<String>();

            File file = SPIFFS.open(defaultFileName, FILE_WRITE);
            int size = file.print(mapJSON);

            if (size != mapJSON.length()) {
                Serial.println("Error writing to file");
            }
            file.close();
            Serial.printf("[Event:save] %d: %d,  %s\n", size, mapJSON.length(), mapJSON.c_str());
        } else if (eventName == "upload") {
            clear();

            //    jsonData.getBytes(mapFile, jsonData.length() + 1);
            //    file = SPIFFS.open(defaultFileName.c_str(), FILE_WRITE);
            //    file.write(mapFile, jsonData.length()+1);
            //    file.close();
            //    loadNoditronFile();

            //memcpy(wsInput, mapFile, strlen((char *)mapFile));
/*
            char mapFileStr[sizeof(mapFile) + 1];  // +1 for the null terminator
            memcpy(mapFileStr, mapFile, sizeof(mapFile));
            mapFileStr[sizeof(mapFile)] = '\0';  // Null-terminate the string

            SERIAL.printf("[Event::upload] mapFile: %s\n", mapFileStr);

            deserializeJson(djsondoc, mapFile);
            JsonObject root = djsondoc.as<JsonObject>();*/
            Serial.printf("[Upload::node] Order: %s\n", order.c_str());

            JsonArray nodes = eventData["nodes"];
            for (JsonVariant n : nodes) {
                JsonObject node = n.as<JsonObject>();
                addNode(node);
            }

            report();
        } else if (eventName == "id")
        {
            StaticJsonDocument<200> data;
            data["id"] = DEVICE_NAME;
            Serial.printf("[id.response] : %s\n", data.as<string>());
            sendToSocket("id", data.as<JsonObject>());
        }
        else if (eventName == "updateNode")
        {
            Serial.printf("[updateNode] id: %d\n", id);
            if (nodes[id])
            {
                Serial.printf("[updateNode.found] id: %d\n", id);
                nodes[id]->setValues(djsondoc[1]["newData"]["properties"]);
            }
        }
        else if (eventName == "updateInputs")
        {
            Serial.printf("[updateInputs] id: %d\n", id);
            int id = eventData["nodeID"].as<int>();
            if (nodes[id])
            {
                for (JsonPair p : eventData["properties"].as<JsonObject>())
                {
                    Serial.printf("[updateInputs.found] id: %d, key: %s\n", id, p.key().c_str());
                    nodes[id]->setInput(p.key().c_str(), 0, p.value()["inpValue"].as<int>());
                }
            }
        }
        else if (eventName == "createNode")
        {
            Node *newNode = addNode(eventData);
            if (newNode)
            {
                eventData["nodeID"] = newNode->id;
                Serial.printf("[\"createNode\", %s]\n", djsondoc[1].as<string>().c_str());
            } else {
                Serial.printf("[event::createNode:error] id: %d\n", djsondoc[1].as<int>());
            }
            // sendToSocket("createNode", djsondoc[1]);
        }
        else if (eventName == "moveNodeOnGrid")
        {
            nodes[id]->pos[0] = eventData["moveTo"][0].as<int>();
            nodes[id]->pos[1] = eventData["moveTo"][1].as<int>();

            Serial.printf("[nodework:dropped] name: %s\n", eventName.c_str());
            sendToSocket("nodeMoved", eventData);
        }
        else if (eventName == "removeNode")
        {
            Serial.printf("[removeNode] id: %d\n", id);
            removeNode(id);
            StaticJsonDocument<16> data;
            data["id"] = id;
            sendToSocket("nodeRemoved", data.as<JsonObject>());
        }
    }

    //Serial.printf("[nodework:nodes] : %d\n", nodes.size());
    for (auto n : nodes)
    {
        if (n.second == nullptr)
            continue;

        vector<string> changedProps = n.second->run();
        for (string prop : changedProps)
        {
            StaticJsonDocument<512> jsonDoc;
            jsonDoc.add("updateNode");
            JsonObject data = jsonDoc.createNestedObject();

            data["nodeID"] = n.second->id;
            data["prop"] = prop;
            data["properties"] = nodes[n.second->id]->getValue(prop);

            // sendToSocket("updateNode", data.as<JsonObject>());
            Serial.printf("%s\n", jsonDoc.as<string>().c_str());
        }
    }
    return {};
}