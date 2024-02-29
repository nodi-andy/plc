#include "node.h"

using namespace std;

void Node::setInput(string inputName, int who, int val)
{
    inputs[inputName][who] = std::make_tuple(val, true);
};

int Node::hasInput(string name)
{
    for (auto& pair : inputs[name]) {
        if (get<1>(pair.second)) return true;
    }
    return false;
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
    }
    for (auto& pair : inputs[name]) {
        get<1>(pair.second) = false;
    }
};

void Node::setValue(string name, int val)
{
    vals[name] = val;
};

void Node::setValue(string name, string val)
{
    strVals[name] = val;
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
        Serial.printf("Adding property: %s", propertyName);
        // addProp(propertyName);
        if (property.value().is<int>()) {
          int v = property.value().as<int>();
          setValue(propertyName, v);
            Serial.printf("int: %d", v);
        } else if (property.value().is<const char*>()) {
          string v = property.value().as<const char*>();
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
