#include "or.h"

LogicOr::LogicOr() {
    this->setup();
}

// init the node
void LogicOr::setup() {
    this->title = "LogicOr";
    this->desc = "Read input";
    this->name = "logic/or";

    addInput("a");
    addInput("b");
    addOutput("v");
    this->lastIncInput = this->getInput(0);
}

void LogicOr::onExecute() {
    int a = this->getInput(0);
    int b = this->getInput(1);
    this->setOutput(0, a || b);
}