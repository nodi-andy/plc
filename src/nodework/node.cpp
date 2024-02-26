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
        return std::get<1>(inputs[name].begin()->second);
    }
    else
    {
        return std::get<1>(inputs[name][who]);
    }
};

int Node::getValue(string name)
{
    return vals[name];
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

void Node::setOutput(string name, int val)
{
    get<0>(outputs[name]) = val;
};

int Node::hasOutput(string name)
{
    return get<1>(outputs[name]);
};
void Node::clearOutput(string name){
    get<1>(outputs[name]) = false;
}
int Node::getOutput(string name)
{
    return get<0>(outputs[name]);
};

void Node::setProps(JsonObject newProps)
{
    //jsonString.clear();
    //serializeJson(newProps, jsonString);
    // Serial.printf("setProp: string = %s\n", jsonString.c_str() );


    for (JsonPair property : newProps)
    {
        const char *propertyName = property.key().c_str();

        // Call your addInput function with propertyName
        Serial.print("Adding property: ");
        Serial.println(propertyName);
        // addProp(propertyName);
        setValue(propertyName, property.value()["value"]);
    }
}

JsonObject Node::getProps()
{
    // Estimate the size needed for the JSON document.
    // This depends on the content and size of your properties.
    const size_t capacity = JSON_OBJECT_SIZE(vals.size()) + vals.size() * 10; // Adjust the multiplier as needed.
    DynamicJsonDocument doc(capacity);

    // Iterate over the unordered_map and add each property to the JsonObject.
    for (const auto& val : vals)
    {
        // Use val.first as the key, and the result of getValue(val.first) as the value.
        doc[val.first] = getValue(val.first);
    }

    return doc.as<JsonObject>();
}

void Node::setup()
{
}

vector<string> Node::run()
{
    return {};
}
