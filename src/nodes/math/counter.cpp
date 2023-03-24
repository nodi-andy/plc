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
    addInput("increment");
    addInput("decrement");
    addInput("reset");
    addOutput("change");
    addOutput("value");
    //lastIncInput = *getInput(0);
}

int Counter::onExecute() {
    int *newIncInput = getInput(0);
    if (newIncInput) {
        value += *newIncInput;
        //Serial.print("Increment: ");
        //Serial.println(value);
    }

    int *newDecInput = getInput(1);
    if (newDecInput) {
        value -= *newDecInput;
        //Serial.print("Increment: ");
        //Serial.println(value);
    }

    int *newResetInput = getInput(2);
    if (newResetInput) {
        if (*newResetInput) {
            value = 0;
        }
        //Serial.print("Reset");
    }
    setOutput(0, &value);
    return 0;
}
