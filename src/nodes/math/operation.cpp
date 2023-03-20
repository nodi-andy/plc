#include "operation.h"

// Mathematical Operation
Operation::Operation() {
}

void Operation::setup() {
    Serial.println("Setup Math/Operation");
    title = "Math Operation";
    desc = "Read input";
    if (props["properties"].containsKey("OP")) {
      myVariant = props["properties"]["OP"].as<std::string>();
    }

    addInput("value1");
    addInput("value2");
    addOutput("result");
}

void Operation::onExecute() {
    if (myVariant == "=") {
        //Serial.print(this->getInput("value1"));
        //Serial.println(this->getInput("value2"));
        //value = (*getInput(0) == *getInput(1));
        //setOutput(0, &value);
    } else if (myVariant == "+") {

    }
}