#include "math_op.h"

// Mathematical Operation
MathOp::MathOp(MathOpVariants variant) {
    setup(variant);
}

void MathOp::setup(MathOpVariants variant) {
    title = "Math Operation";
    desc = "Read input";
    myVariant = variant;

    addInput("value1");
    addInput("value2");
    addOutput("result");
}

void MathOp::onExecute() {
    if (myVariant == MathOpVariants::IsEq) {
        //Serial.print(this->getInput("value1"));
        //Serial.println(this->getInput("value2"));
        value = (*getInput(0) == *getInput(1));
        setOutput(0, &value);
    }
}