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
    output = NULL;
    int *inpA = getInput("a");
    int *inpB = getInput("b");
    if (inpA) {
        A = *inpA;
        setInput("a", NULL);
        Serial.print("A gate:");
        Serial.println(A);
        update = true;
    }
    if (inpB) {
        B = *inpB;
        setInput("b", NULL);
        output = &value;
        Serial.print("B gate:");
        Serial.println(B);
        update = true;
    }
 
    if (update) {
        value = A || B;
        output = &value;
        setOutput("v", output);
        Serial.println("AND gate output ");
    }
    return 0;
}