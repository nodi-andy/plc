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

void Counter::onExecute() {
    int *newIncInput = getInput(0);
    if (newIncInput && (lastIncInput != *newIncInput)) {
        value += *newIncInput;
        //Serial.print("Increment: ");
        //Serial.println(value);
        lastIncInput = *newIncInput;
    }

    int *newDecInput = getInput(1);
    if (newIncInput && (lastDecInput != *newDecInput)) {
        value -= *newDecInput;
        //Serial.print("Increment: ");
        //Serial.println(value);
        lastDecInput = *newDecInput;
    }

    int *newResetInput = getInput(2);
    if (newResetInput && (lastResetInput != *newResetInput) ) {
        value = 0;
        //Serial.print("Reset");
        lastResetInput = *newResetInput;
    }
    setOutput(0, &value);
}
