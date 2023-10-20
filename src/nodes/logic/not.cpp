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
    bool update = false;
    output = 0;
    int inpA = getInput("a");
    if (inpA != INT_MAX) {
        value = !(inpA);
        setInput("a", INT_MAX);
        Serial.print("A gate:");
        Serial.println(value);
        update = true;
    }
 
    if (update) {
        output = value;
        setOutput("v", output);
        Serial.println("NOT gate output ");
    }
    return 0;
}