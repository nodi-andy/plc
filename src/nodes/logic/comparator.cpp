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

void Comparator::onExecute() {
    value = (*getInput(0) == *getInput(1));
    this->setOutput(0, &value);
}