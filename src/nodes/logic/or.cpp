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

int LogicOr::onExecute() {
    bool update = false;
    value = 0;
    int *inpA = getInput(0);
    int *inpB = getInput(1);
    if (inpA) {
        A = *inpA; 
        // Serial.print("A gate:");
        // Serial.println(A);
    }
    if (inpB) {
        B = *inpB;
        // Serial.print("B gate:");
        // Serial.println(B);
    }
    if (inpA || inpB) update = true;
    if (update) {
        value = A || B;
        setOutput(0, &value);
        // Serial.printf("AND gate: %d\n", value);
    }
    return 0;
}