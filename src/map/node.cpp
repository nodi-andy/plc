#include "node.h"

void Node::addInput(std::string name) {
    inputs.push_back(0);
}

void Node::addOutput(std::string name) {
    outputs.push_back(0);
}

int* Node::getInput(int name) {
    return inputs[name];
};

int* Node::getOutput(int name) {
    if (name >= 0 && name < outputs.size()) {
        return outputs[name];
    } else {
        // handle error - index out of bounds
        return 0;
    }
};

void Node::setInput(int name, int* val) {
    if (name >= 0 && name < inputs.size()) {
        inputs[name] = val;
        //Serial.println(*val);
    }else {
        Serial.println("ERR: Input index out ouf bounds");
    }
};

void Node::setOutput(int name, int* val) {
    if (name >= 0 && name < outputs.size()) {
        outputs[name] = val;
    } 
};

void Node::setup()
{

}
int Node::onExecute()
{
    
}
