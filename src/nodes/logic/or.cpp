#include "or.h"

LogicOr::LogicOr() {
    setup();
}

// init the node
void LogicOr::setup() {
    title = "LogicOr";
    desc = "Read input";
    name = "logic/or";

    addInput("a");
    addInput("b");
    addOutput("v");
}

void LogicOr::onExecute() {
    value = (*getInput(0) || *getInput(1));
    this->setOutput(0, &value);
}