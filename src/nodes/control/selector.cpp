#include "selector.h"

Selector::Selector() {
    setup();
}

// init the node
void Selector::setup() {
    title = "Selector";
    desc = "Read input";
    name = "logic/and";

    addInput("a");
    addInput("b");
    addInput("select");
    addOutput("v");
}

void Selector::onExecute() {
    int* inpA = getInput(0);
    int* inpB = getInput(1);
    int* inpSelect = getInput(2);
    if (inpSelect) {
        if (true == *inpSelect) {
            setOutput(0, inpA);
            //Serial.println("Selector A");
        } else if (false == *inpSelect) {
            setOutput(0, inpB);
            //Serial.println("Selector B");
        }
    } else {
        if (inpA) {
            setOutput(0, inpA);
        } else if (inpB) {
            setOutput(0, inpB);
        } else {
            this->setOutput(0, 0);
        }
    }
}