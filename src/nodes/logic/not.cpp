#include "not.h"

LogicNot::LogicNot() {
}

// init the node
void LogicNot::setup() {
    title = "LogicNot";
    desc = "Read input";
    name = "logic/or";

    addInput("a");
    addOutput("v");
}

void LogicNot::onExecute() {
    value = !(*getInput(0));
    setOutput(0, &value);
}