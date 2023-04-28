#include "counter.h"

Counter::Counter() {
    setup();
}

// init the node
void Counter::setup() {
    title = "Counter";
    desc = "Read input";
    name = "events/counter";

    value = 0;
    addInput("inc");
    addInput("dec");
    addInput("set");
    addOutput("v");
}

int Counter::onExecute() {
    int ret = 0;
    int *newIncInput = getInput("inc");
    if (newIncInput) {
        newvalue += *newIncInput;
        setInput("inc", NULL);
        Serial.print("Increment: ");
        Serial.println(newvalue);
    }

    int *newDecInput = getInput("dec");
    if (newDecInput) {
        newvalue -= *newDecInput;
        setInput("dec", NULL);
        Serial.print("Decrement: ");
        Serial.println(newvalue);
    }

    int *newResetInput = getInput("reset");
    if (newResetInput) {
        if (*newResetInput) {
            newvalue = 0;
        }
        setInput("reset", NULL);
        //Serial.print("Reset");
    }
    ret = (value != newvalue);
    value = newvalue;
    if (ret) {
        setOutput("v", &value);
    }
    return ret;
}
