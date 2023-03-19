#include "and.h"

LogicAnd::LogicAnd() {
    setup();
}

// init the node
void LogicAnd::setup() {
    title = "LogicAnd";
    desc = "Read input";
    name = "logic/and";

    addInput("a");
    addInput("b");
    addOutput("v");
}

void LogicAnd::onExecute() {
    value = *getInput(0) && *getInput(1);
    this->setOutput(0, &value);
}