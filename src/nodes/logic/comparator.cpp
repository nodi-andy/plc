#include "comparator.h"

Comparator::Comparator() {
}

// init the node
void Comparator::setup() {
    title = "IsEq";
    desc = "Read input";
    name = "logic/and";

    addInput("a");
    addInput("b");
    addOutput("v");
}

int Comparator::onExecute() {
    value = (getInput("A") == getInput("B"));
    this->setOutput(0, value);
    return 0;
}