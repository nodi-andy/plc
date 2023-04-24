#include "node.h"

void Node::addInput(std::string name) {
    inputs.insert({name, NULL});
}

void Node::addOutput(std::string name) {
    outputs.insert({name, NULL});
}

int* Node::getInput(std::string name) {
    return inputs[name];
};

int* Node::getOutput(std::string name) {
    return outputs[name];
};

void Node::setInput(std::string name, int* val) {
    inputs[name] = val;
};

void Node::setOutput(std::string name, int* val) {
    outputs[name] = val;
};

void Node::setup()
{

}
int Node::onExecute()
{
    return 0;
}
