#include "isless.h"

IsLess::IsLess() {
}

// init the node
void IsLess::setup() {
    title = "is less";
    desc = "Is less";
    name = "math/isless";


    addInput("a");
    addInput("b");
    addOutput("v");
    value = 1;
    state = 0;
}

int IsLess::onExecute() {
    bool update = false;
    output = 0;
    if (getInput("a")) {
        A = getInput("a");
        setInput("a", INT_MAX);
        Serial.print("A gate:");
        Serial.println(A);
        update = true;
    }
    
    if (getInput("b")) {
        B = getInput("b");
        setInput("b", INT_MAX);
        output = value;
        Serial.print("B gate:");
        Serial.println(B);
        update = true;
    }
 
    if (update) {
        value = (A < B);
        output = value;
        setOutput("v", output);
        Serial.println("IsEqual output ");
    }
    return 0;
}