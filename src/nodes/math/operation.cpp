#include <algorithm>
#include "operation.h"

// Mathematical Operation
Operation::Operation() {
}

void Operation::setup() {
    Serial.println("Setup Math/Operation");
    title = "Math Operation";
    desc = "Read input";

    if (props["properties"].containsKey("A")) {
      defaultA = props["properties"]["A"].as<int>();
    }

    if (props["properties"].containsKey("B")) {
      defaultB = props["properties"]["B"].as<int>();
    }

    addInput("value1");
    addInput("value2");
    addOutput("result");
}

int Operation::onExecute() {
    value = 0;
    int *inpA = getInput("A");
    int *inpB = getInput("B");

    if (inpA == 0) inpA = &defaultA;
    if (inpB == 0) inpB = &defaultB;

    if (myVariant == "==") {
        value = (*inpA == *inpB);
    } else if (myVariant == "+") {
        value = *inpA + *inpB;
        //Serial.print("OP+: ");
        //Serial.println(value);
    } else if (myVariant == "-") {
        value = *inpA - *inpB;
    } else if (myVariant == "*") {
        value = (*inpA) * (*inpB);
    } else if (myVariant == "/") {
        if ((*inpB) != 0) {
            value = (*inpA) / (*inpB);
        }
    } else if (myVariant == ">") {
        value = *inpA > *inpB;
    } else if (myVariant == "<") {
        value = *inpA < *inpB;
    } else if (myVariant == ">=") {
        value = *inpA >= *inpB;
    } else if (myVariant == "<=") {
        value = *inpA > *inpB;
    } else if (myVariant == "%") {
        value = *inpA % *inpB;
    } else if (myVariant == "^") {
        value = *inpA ^ *inpB;
    } else if (myVariant == "max") {
        value = std::max(*inpA, *inpB);
    } else if (myVariant == "min") {
        value = std::min(*inpA, *inpB);
    }
    setOutput(0, &value);
    return 0;
}