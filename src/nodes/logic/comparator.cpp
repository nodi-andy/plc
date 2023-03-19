#include "comparator.h"

Comparator::Comparator() {
    this->setup();
}

// init the node
void Comparator::setup() {
    this->title = "IsEq";
    this->desc = "Read input";
    this->name = "logic/and";

    addInput("a");
    addInput("b");
    addOutput("v");
}

void Comparator::onExecute() {
    value = (*getInput(0) == *getInput(1));
    this->setOutput(0, &value);
}