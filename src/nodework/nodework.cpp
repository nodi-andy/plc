#include <unordered_map>
#include "nodework.h"

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
void Map::addNode(int id, Node *newNode)
{
    if (newNode)
    {
        nodes[id] = newNode;
        Serial.printf("[Map::addNode] ID=%d type = %s \n", id, newNode->getType().c_str());
        setNodeOnGrid(newNode->pos[0], newNode->pos[1], newNode);
        newNode->setup();
    }
}

// use json to create a node
Node *Map::addNode(JsonObject json)
{
    string type = json["type"].as<std::string>();
    Serial.printf("[Map::addNode:json]: %s\n", type.c_str());

    Node *newNode = RegistryManager::getInstance().createNode(type);
    if (newNode != nullptr)
    {
        newNode->setProps(json["node"]["properties"]);
        newNode->id = json["node"][JSON_NODE_ID].as<int>();
        newNode->pos[0] = json["pos"][0].as<int>();
        newNode->pos[1] = json["pos"][1].as<int>();
        newNode->type = json["type"].as<string>();
        newNode->parent = this;
        addNode(newNode->id, newNode);
        Serial.printf("[Map:addNode:done] id: %d, type: %s\n", newNode->id, newNode->getType().c_str());
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

    JsonArray jsNodes = map.createNestedArray("nodes");
    Serial.println("[Map::toJSON]:");
    for (auto n : nodes)
    {
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

void Map::report()
{
    Serial.println("");
    Serial.println(">>>>>>>");
    Serial.println("NODES:");
    for (auto n : nodes)
    {
        Serial.print(n.first);
        Serial.print(" : ");
        if (n.second)
        {
            Serial.println(n.second->getType().c_str());
        }
    }

    Serial.println(">>>>>>>");
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
    /*for (auto const &nb : NodiEnums::allVec)
    {
        Node *nbNode = getNodeOnGrid(x + nb.x, y + nb.y);
        if (nbNode)
        {
            nbNode->reconnect();
        }
    }*/
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

        char *sptr = NULL;
        int msgid = strtol(order.c_str(), &sptr, 10);
        if (msgid)
            order = sptr;
        deserializeJson(djsondoc, order.c_str(), order.length());
        String eventName = djsondoc[0];
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
        }
        else if (eventName == "id")
        {
            StaticJsonDocument<200> data;
            data["id"] = DEVICE_NAME;
            Serial.printf("[id.response] : %s\n", data.as<string>());
            sendToSocket("id", data.as<JsonObject>());
        }
        else if (eventName == "moveNode")
        {
            // SERIAL.printf("[nodework:move] name: %s\n", eventName.c_str());
        }
        else if (eventName == "updateNode")
        {
            Serial.printf("[updateNode] id: %d\n", id);
            if (nodes[id])
            {
                Serial.printf("[updateNode.found] id: %d\n", id);
                nodes[id]->setProps(djsondoc[1]["newData"]["properties"]);
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
            }
            Serial.printf("[event::createNode] id: %d\n", djsondoc[1].as<int>());
            Serial.printf("[\"createNode\", %s]\n", djsondoc[1].as<string>().c_str());
            // sendToSocket("createNode", djsondoc[1]);
        }
        else if (eventName == "moveNodeOnGrid")
        {
            nodes[id]->pos[0] = eventData["moveTo"][0].as<int>();
            nodes[id]->pos[1] = eventData["moveTo"][1].as<int>();

            Serial.printf("[nodework:dropped] name: %s\n", eventName.c_str());
            sendToSocket("nodeMoved", eventData);
        }
        else if (eventName == "resizedNode")
        {
            nodes[id]->size[0] = eventData["size"][0].as<int>();
            nodes[id]->size[1] = eventData["size"][1].as<int>();

            Serial.printf("[nodework:resized] name: %s\n", eventName.c_str());
            sendToSocket("nodeResized", eventData);
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