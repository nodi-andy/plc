#include "node.h"

using namespace std;

void Node::setInput(string inputName, int who, int val)
{
    inputs[inputName][who] = std::make_tuple(val, true);
};

void Node::setInput(string inputName, int who, string val)
{
    inputStrs[inputName][who] = std::make_tuple(val, true);
};

bool Node::hasStrInput(string name)
{
    for (auto& pair : inputStrs[name]) {
        if (get<1>(pair.second)) return true;
    }
    return false;
};

bool Node::hasIntInput(string name)
{
    for (auto& pair : inputs[name]) {
        if (get<1>(pair.second)) return true;
    }
    return false;
};

int Node::hasInput(string name)
{
    return hasStrInput(name) || hasIntInput(name);
};

int Node::getInput(string name, int who)
{
    if (who < 0)
    {
        return std::get<0>(inputs[name].begin()->second);
    }
    else
    {
        return std::get<0>(inputs[name][who]);
    }
};

string Node::getStrInput(string name, int who)
{
    if (who < 0)
    {
        return std::get<0>(inputStrs[name].begin()->second);
    }
    else
    {
        return std::get<0>(inputStrs[name][who]);
    }
};

int Node::getValue(string name)
{
    return vals[name];
};

string Node::getStrValue(string name)
{
    return strVals[name];
};

void Node::clearInputsByNodeID(int nodeID){
    for (auto& input : inputs) {
        // Use an iterator to iterate through the std::map so we can safely erase elements
        for (auto it = input.second.begin(); it != input.second.end(); ) {
            // Check if the key matches nodeID
            if (it->first == nodeID) {
                // Erase the element using the iterator, and update the iterator to the next element
                it = input.second.erase(it);
            } else {
                // Move to the next element
                ++it;
            }
        }
    }
}
void Node::clearInput(string name){
    if (name == "") {
        // clear all
        inputs.clear();
        inputStrs.clear();
    }
    for (auto& pair : inputs[name]) {
        get<1>(pair.second) = false;
    }
    for (auto& pair : inputStrs[name]) {
        get<1>(pair.second) = false;
    }
};

void Node::setValue(string name, int val)
{
    vals[name] = val;
    //Serial.printf("[Node::setValue] %s = %d\n", name.c_str(), val);
};

bool Node::hasValue(string name) {
    return vals.count(name) != 0 || strVals.count(name) != 0;
};

void Node::setValue(string name, string val)
{
    strVals[name] = val;
    Serial.printf("[Node::setValue] %s = %s\n", name.c_str(), val.c_str());
};

void Node::setOutput(string name, int val)
{
    outputs[name] = make_pair(val, true);
};

int Node::hasOutput(string name)
{
    if(outputs.count(name))
      return get<1>(outputs[name]);
    else
      return 0;
};

void Node::clearOutput(string name){
    get<1>(outputs[name]) = false;
}

int Node::getOutput(string name)
{
    return get<0>(outputs[name]);
};

void Node::setValues(JsonObject newProps)
{
    //jsonString.clear();
    //serializeJson(newProps, jsonString);
    // Serial.printf("setProp: string = %s\n", jsonString.c_str() );


    for (JsonPair property : newProps)
    {
        const char *propertyName = property.key().c_str();

        // Call your addInput function with propertyName

        Serial.printf("Adding property: %s ", propertyName);
        JsonVariant prop = property.value()["value"];
        // addProp(propertyName);
        if (prop.is<int>()) {
            int v = prop.as<int>();
            setValue(propertyName, v);
            Serial.printf("int: %d : %d", v, getValue(propertyName));
        } else if (prop.is<const char*>()) {
            string v = prop.as<const char*>();
            Serial.printf("string: %s", v.c_str());
            setValue(propertyName, v);
        }
        Serial.printf("\n");
    }
}



void Node::setup()
{
}

vector<string> Node::run()
{
    return {};
}
