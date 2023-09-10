#include "node.h"


void Node::setupVals() {
        // Iterate through the properties object
    for (JsonPair property : props["properties"].as<JsonObject>()) {
      JsonObject propObj = property.value().as<JsonObject>();
      const char* propertyName = property.key().c_str();
      
      // Call your addInput function with propertyName
      Serial.print("Adding property: ");
      Serial.println(propertyName);
      addProp(propertyName);
      vals[propertyName] = props["properties"][propertyName]["value"].as<int>();
    }
}
void Node::addProp(std::string name) {
    inputVals.insert({name, {NULL, NULL}});
}

void Node::addInput(std::string name) {
    inputs.insert({name, NULL});
}

void Node::addOutput(std::string name) {
    outputs.insert({name, NULL});
}

int* Node::getInput(std::string name) {
    return inputVals[name][0];
};

int* Node::getOutput(std::string name) {
    return inputVals[name][1];
};

void Node::setInput(std::string name, int* val) {
    inputVals[name][0] = val;
    inputs[name] = val;
};

void Node::setOutput(std::string name, int* val) {
    outputs[name] = val;
    inputVals[name][1] = val;
};

void Node::setup()
{

}
int Node::onExecute()
{
    return 0;
}
