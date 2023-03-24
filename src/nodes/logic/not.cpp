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
    int *inpA = getInput(0);
    if (inpA) {
        value = !(*inpA);
        setOutput(0, &value);
    } else {
        setOutput(0, 0);
    }
    return 0;
}