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
    addOutput("n");
}

int Counter::onExecute() {
    int ret = 0;
    if (getInput("inc")) {
        newvalue += *getInput("inc");
        setInput("inc", NULL);
        Serial.print("Increment: ");
        Serial.println(newvalue);
    }

    if (getInput("dec")) {
        newvalue -= *getInput("dec");
        setInput("dec", NULL);
        Serial.print("Decrement: ");
        Serial.println(newvalue);
    }

    if (getInput("set")) {
        if (*getInput("set")) {
            newvalue = 0;
        }
        setInput("set", NULL);
        //Serial.print("Reset");
    }
    ret = (value != newvalue);
    value = newvalue;
    if (ret) {
        setOutput("n", &value);
    }
    return ret;
}
