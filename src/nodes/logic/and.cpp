#include "and.h"

LogicAnd::LogicAnd() {
    this->setup();
}

// init the node
void LogicAnd::setup() {
    this->title = "LogicAnd";
    this->desc = "Read input";
    this->name = "logic/and";

    addInput("a");
    addInput("b");
    addOutput("v");
    this->lastIncInput = this->getInput(0);
}

void LogicAnd::onExecute() {
    int a = this->getInput(0);
    int b = this->getInput(1);
    this->setOutput(0, a && b);
}