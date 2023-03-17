#include "not.h"

LogicNot::LogicNot() {
    this->setup();
}

// init the node
void LogicNot::setup() {
    this->title = "LogicNot";
    this->desc = "Read input";
    this->name = "logic/or";

    addInput("a");
    addOutput("v");
    this->lastIncInput = this->getInput(0);
}

void LogicNot::onExecute() {
    int a = this->getInput(0);
    this->setOutput(0, !a);
}