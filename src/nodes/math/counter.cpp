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
    int newIncInput = *getInput(0);
    if (lastIncInput == 0 && newIncInput > 0) {
        value++;
        Serial.print("Increment: ");
        Serial.println(value);
    }
    lastIncInput = newIncInput;
    setOutput(0, &value);

    int newResetInput = *getInput(2);
    if (lastResetInput == 0 && newResetInput > 0) {
        value = 0;
        Serial.print("Reset");
    }
    lastResetInput = newResetInput;
}
