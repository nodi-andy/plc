#include "counter.h"

Counter::Counter() {
    this->setup();
}

// init the node
void Counter::setup() {
    this->title = "Counter";
    this->desc = "Read input";
    this->name = "events/counter";

    this->value = 0;
    addInput("increment");
    addInput("reset");
    addOutput("change");
    addOutput("value");
    this->lastIncInput = this->getInput(0);
}

void Counter::onExecute() {
    int newIncInput = this->getInput(0);
    if (this->lastIncInput == 0 && newIncInput > 0) {
        this->value++;
        Serial.print("Increment: ");
        Serial.println(this->value);
    }
    this->lastIncInput = newIncInput;
    this->setOutput(0, this->value);

    int newResetInput = this->getInput(1);
    if (this->lastResetInput == 0 && newResetInput > 0) {
        this->value = 0;
        Serial.print("Reset");
    }
    this->lastResetInput = newResetInput;
}