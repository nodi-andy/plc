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
    value = 1;
    state = 0;
}

int LogicAnd::onExecute() {
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
        value = A && B;
        output = &value;
        setOutput("v", output);
        Serial.println("AND gate output ");
    }
    return 0;
}