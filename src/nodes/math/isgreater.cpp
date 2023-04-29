#include "isgreater.h"

IsGreater::IsGreater() {
}

// init the node
void IsGreater::setup() {
    title = "is less";
    desc = "Is less";
    name = "math/isgreater";


    addInput("a");
    addInput("b");
    addOutput("v");
    value = 1;
    state = 0;
}

int IsGreater::onExecute() {
    bool update = false;
    output = NULL;
    if (getInput("a")) {
        A = *getInput("a");
        setInput("a", NULL);
        Serial.print("A gate:");
        Serial.println(A);
        update = true;
    }

    if (getInput("b")) {
        B = *getInput("b");
        setInput("b", NULL);
        output = &value;
        Serial.print("B gate:");
        Serial.println(B);
        update = true;
    }
 
    if (update) {
        value = (A > B);
        output = &value;
        setOutput("v", output);
        Serial.println("IsEqual output ");
    }
    return 0;
}