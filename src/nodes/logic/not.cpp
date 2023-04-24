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

int LogicNot::onExecute() {
    value = 0;
    int *inpA = getInput("a");
    if (inpA) {
        value = !(*inpA);
        setOutput("v", &value);
    } else {
        setOutput("v", 0);
    }
    return 0;
}