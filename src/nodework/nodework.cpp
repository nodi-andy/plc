#include <unordered_map>
#include "nodework.h"
#include <SPIFFS.h>
#include <FS.h>
#include <sstream>

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
void Map::addNode(int x, int y, Node *newNode)
{
    if (newNode && nodes.count(newNode->id) == 0)
    {
        nodes[newNode->id] = newNode;
        Serial.printf("[Map::addNode] ID= %d type= %s n= %d\n", newNode->id, newNode->getType().c_str(), nodes.size());
        setNodeOnGrid(x, y, newNode->id);
        newNode->setup();
    }
}

// add the node in nodelist
void Map::addNode(Node *newNode)
{
    if (newNode && nodes.count(newNode->id) == 0)
    {
        nodes[newNode->id] = newNode;
        Serial.printf("[Map::addNode] ID= %d type= %s n= %d\n", newNode->id, newNode->getType().c_str(), nodes.size());
        newNode->setup();
    }
}

// use json to create a node
Node *Map::addNode(JsonObject json)
{
    if (json.containsKey("type") == false)
        return nullptr;
    string type = json["type"].as<std::string>();
    Serial.printf("[Map:createNode:type] : %s\n", type.c_str());

    Node *newNode = RegistryManager::getInstance().createNode(type);
    if (newNode != nullptr)
    {
        newNode->parent = this;
        newNode->setValues(json["node"]["properties"]);
        newNode->id = json["node"][JSON_NODE_ID].as<int>();
        newNode->type = type;
        Serial.printf("[Map:createNode:done] id: %d, type: %s\n", newNode->id, newNode->getType().c_str());
        if (json.containsKey("pos")) {
            addNode(json["pos"][0].as<int>(), json["pos"][1].as<int>(), newNode);
        } else {
            addNode(newNode);
        }
    }
    return newNode;
}

void Map::clear()
{
    nodes.clear();
    nodesByPos.clear();
    usedIDs.clear();
    nextID = 0;
    Serial.println("[Map::clear]");
}

JsonDocument Map::toJSON()
{
    JsonDocument doc;
    JsonObject map = doc.to<JsonObject>();

    JsonArray jsNodes = map["nodes"].to<JsonArray>();
    Serial.printf("[Map::toJSON]: %d\n", nodes.size());
    for (auto np : nodes)
    {
        Node *n = np.second;
        if (n)
        {
            Serial.printf("[nodes: %d]\n", n->id);

            JsonObject nodeObject = jsNodes.createNestedObject();
            nodeObject["type"] = n->type;

            JsonObject node = nodeObject.createNestedObject("node");
            node["nodeID"] = n->id;
            node["properties"] = jsNodes.add<JsonObject>();
            for (const auto &val : n->vals)
            {
                // Use val.first as the key, and the result of getValue(val.first) as the value.
                node["properties"][val.first]["value"] = n->getValue(val.first);
                Serial.printf("[Map::toJSON::getIntValue] : %s: %d\n", val.first.c_str(), n->getValue(val.first));
            }
            for (const auto &val : n->strVals)
            {
                // Use val.first as the key, and the result of getValue(val.first) as the value.
                node["properties"][val.first]["value"] = n->getStrValue(val.first);
                Serial.printf("[Map::toJSONgetStrValue] : %s: %s\n", val.first.c_str(), n->getStrValue(val.first).c_str());
            }
        }
    }
    JsonObject jsNodesByPos = map["nodesByPos"].to<JsonObject>();
    for (auto n : nodesByPos)
    {
        auto pos = n.first;
        int x = pos.first;
        int y = pos.second;
        string s = to_string(x) + STR_SEP + to_string(y);
        jsNodesByPos[s] = n.second;
        Serial.printf("[Map::toJSON:nodesByPos] : %s\n", s.c_str());
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

int *Map::getNodeIDOnGrid(int x, int y)
{
    auto it = nodesByPos.find(std::make_pair(x, y));
    if (it != nodesByPos.end()) {
        // Found the node, return a pointer to it
        return &(it->second);
    } else {
        // Node doesn't exist, return nullptr
        return nullptr;
    }
}

Node *Map::getNodeOnGrid(int x, int y)
{
    int *id = getNodeIDOnGrid(x, y);
    if (id)  return nodes[*id];
    return nullptr;
}

void Map::removeNodeOnGrid(int x, int y)
{
    int *id = getNodeIDOnGrid(x, y);
    if (!id) return;
    if (getNumberOfNodes(*id) == 0) {
        Node *n = getNodeById(*id);
        if (n) {
            Serial.printf("[removeNodeOnGrid: %d]\n", n->id);
            delete n;
        }
        nodes.erase(*id);
    }
    nodesByPos.erase(make_pair(x, y));
    updateNBs(x, y);

}

int Map::getNumberOfNodes(int id)
{
    int count = std::count_if(nodesByPos.begin(), nodesByPos.end(), [id](std::pair<const std::pair<int, int>, int>& pair) {
        return pair.second == id;
    });
    return 0;
}

void Map::rotateNode(int x, int y)
{
    Node *n = getNodeOnGrid(x, y);
    n->dir = static_cast<NodiEnums::Direction>((n->dir + 1) % 4);;
}

void Map::setNodeOnGrid(int x, int y, int id)
{
    nodesByPos[make_pair(x, y)] = id;
    updateNBs(x, y);
}

void Map::updateNBs(int x, int y)
{
    for (auto const &nb : NodiEnums::allVec)
    {
        Node *nbNode = getNodeOnGrid(x + nb.x, y + nb.y);
        if (nbNode)
        {
            nbNode->reconnect(x + nb.x, y + nb.y);
        }
    }
}

void Map::sendToSocket(string key, const JsonObject &msg)
{
    JsonDocument sjsondoc;
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
        JsonDocument djsondoc;
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
            // sendToSocket("setNodework", toJSON().as<JsonObject>());
            Serial.printf("[\"setNodework\", %s]\n", toJSON().as<string>().c_str());
        }
        else if (eventName == "clear")
        {
            clear();
            Serial.printf("[\"clear\", \"\"]\n");
        }
        else if (eventName == "save")
        {
            String mapJSON = toJSON().as<String>();

            File file = SPIFFS.open(defaultFileName, FILE_WRITE);
            int size = file.print(mapJSON);

            if (size != mapJSON.length())
            {
                Serial.println("Error writing to file");
            }
            file.close();
            Serial.printf("[Event:save] %d: %d,  %s\n", size, mapJSON.length(), mapJSON.c_str());
        }
        else if (eventName == "upload")
        {
            clear();

            //    jsonData.getBytes(mapFile, jsonData.length() + 1);
            //    file = SPIFFS.open(defaultFileName.c_str(), FILE_WRITE);
            //    file.write(mapFile, jsonData.length()+1);
            //    file.close();
            //    loadNoditronFile();

            // memcpy(wsInput, mapFile, strlen((char *)mapFile));
            /*
                        char mapFileStr[sizeof(mapFile) + 1];  // +1 for the null terminator
                        memcpy(mapFileStr, mapFile, sizeof(mapFile));
                        mapFileStr[sizeof(mapFile)] = '\0';  // Null-terminate the string

                        SERIAL.printf("[Event::upload] mapFile: %s\n", mapFileStr);

                        deserializeJson(djsondoc, mapFile);
                        JsonObject root = djsondoc.as<JsonObject>();*/
            Serial.printf("[Upload::node] Order: %s\n", order.c_str());

            JsonArray nodes = eventData["nodes"];
            for (JsonVariant n : nodes)
            {
                JsonObject node = n.as<JsonObject>();
                addNode(node);
            }
            JsonObject jsNodesByPos = eventData["nodesByPos"];
            // Iterate through each element in the JsonArray
            for(auto var : jsNodesByPos) {
                std::string key = var.key().c_str(); // Assuming key is the string e.g., "2x5"
                Serial.printf("[KEY] : %s\n", key.c_str());
                int value = var.value().as<int>(); // Assuming value is the integer following the string

                // Split the key on 'x' to separate x and y
                std::istringstream iss(key);
                std::string part;
                std::getline(iss, part, 'x');
                int x = std::stoi(part);
                std::getline(iss, part);
                int y = std::stoi(part);

                // Insert into your map
                setNodeOnGrid(x, y, value);
            }
            report();
        }
        else if (eventName == "id")
        {
            /*StaticJsonDocument<200> data;
            data["id"] = DEVICE_NAME;
            Serial.printf("[id.response] : %s\n", data.as<string>());
            sendToSocket("id", data.as<JsonObject>());*/
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
                    JsonVariant prop = p.value()["inpValue"];
                    if (prop.is<int>()) {
                        Serial.printf("[updateInputs.INT.found] id: %d, key: %s\n", id, p.key().c_str());
                        nodes[id]->setInput(p.key().c_str(), 0, prop.as<int>());
                    } else {
                        // If the value is a string, try to parse it as an integer
                        String stringValue = prop.as<String>();
                        char* endPtr;
                        long intValue = strtol(stringValue.c_str(), &endPtr, 10);
                        
                        // Check if the entire string was successfully converted to an integer (endPtr would point to '\0' in this case)
                        if (*endPtr == '\0') {
                            Serial.printf("[updateInputs.STR-INT.found] id: %d,  %s: %d\n", id, p.key().c_str(), intValue);
                            nodes[id]->setInput(p.key().c_str(), 0, static_cast<int>(intValue)); 
                        } else {
                            // If conversion wasn't successful, process it as a string
                            Serial.printf("[updateInputs.STR.found] id: %d, key: %s\n", id, p.key().c_str());
                            nodes[id]->setInput(p.key().c_str(), 0, stringValue.c_str());
                        }
                    }
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
            }
            else
            {
                Serial.printf("[event::createNode:error] id: %d\n", djsondoc[1].as<int>());
            }
            // sendToSocket("createNode", djsondoc[1]);
        }
        else if (eventName == "moveNodeOnGrid")
        {
            int id = eventData["id"].as<int>();
            removeNodeOnGrid(eventData["from"][0].as<int>(), eventData["from"][1].as<int>());
            setNodeOnGrid(eventData["to"][0].as<int>(), eventData["to"][1].as<int>(), id);
            Serial.printf("[\"moveNodeOnGrid\", %s]\n", djsondoc[1].as<string>().c_str());
        }
        else if (eventName == "rotateNode")
        {
            int x = eventData["pos"][0].as<int>();
            int y = eventData["pos"][1].as<int>();
            rotateNode(x, y);
            Serial.printf("[\"rotateNode\", %s]\n", djsondoc[1].as<string>().c_str());
        }
        else if (eventName == "removeNode")
        {
            int x = eventData["pos"][0].as<int>();
            int y = eventData["pos"][1].as<int>();
            removeNodeOnGrid(x, y);
            Serial.printf("[\"removeNode\", %s]\n", djsondoc[1].as<string>().c_str());
        }
    }

    // Serial.printf("[nodework:nodes] : %d\n", nodes.size());
    for (auto n : nodes)
    {
        if (n.second == nullptr)
            continue;

        vector<string> changedProps = n.second->run();
        for (string prop : changedProps)
        {
            JsonDocument jsonDoc;
            jsonDoc.add("updateNode");
            JsonObject data = jsonDoc.add<JsonObject>();

            data["nodeID"] = n.second->id;
            data["prop"] = prop;
            data["properties"] = nodes[n.second->id]->getValue(prop);

            // sendToSocket("updateNode", data.as<JsonObject>());
            Serial.printf("%s\n", jsonDoc.as<string>().c_str());
        }
    }
    return {};
}