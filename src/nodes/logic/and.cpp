#include "and.h"

LogicAnd::LogicAnd() {
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

int LogicAnd::onExecute() {
    value = 0;
    int *inpA = getInput(0);
    int *inpB = getInput(1);
    if (inpA && inpB) {
        value = *inpA && *inpB;
        setOutput(0, &value);
    } else {
        setOutput(0, 0);
    }
    return 0;
}