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
    value = 0;
    int *inpA = getInput(0);
    int *inpB = getInput(1);
    if (inpA && inpB) {
        value = *inpA || *inpB;
        setOutput(0, &value);
    } else {
        setOutput(0, 0);
    }
}