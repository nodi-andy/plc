#include "counter.h"

Counter::Counter() {
    setup();
}

// init the node
void Counter::setup() {
    title = "Counter";
    desc = "Read input";
    name = "events/counter";
}

int Counter::onExecute() {
    bool update = false;
    if (getInput("inc") != INT_MAX) {
        setValue("value", getValue("value") + getInput("inc"));
        setOutput("value", getValue("value"));

        Serial.print("Increment: ");
        update = true;
        setInput("inc", INT_MAX);
    }

    if (getInput("dec") != INT_MAX) {
        setValue("value", getValue("value") - getInput("dec"));
        setOutput("value", getValue("value"));

        Serial.print("Decrement: ");
        update = true;
        setInput("dec", INT_MAX);
    }

    if (getInput("set") != INT_MAX) {
        update = true;
        //Serial.print("Reset");
        setInput("set", INT_MAX);
    }
    
    if (update) {
        Serial.printf("counter value: %d", getValue("value"));
    }
    return update;
}
