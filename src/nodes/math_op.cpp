#include "math_op.h"

// Mathematical Operation
MathOp::MathOp(MathOpVariants variant) {
    this->setup(variant);
}

void MathOp::setup(MathOpVariants variant) {
    this->title = "Math Operation";
    this->desc = "Read input";
    this->myVariant = variant;

    addInput("value1");
    addInput("value2");
    addOutput("result");
}

void MathOp::onExecute() {
    if (this->myVariant == MathOpVariants::IsEq) {
        //Serial.print(this->getInput("value1"));
        //Serial.println(this->getInput("value2"));
        if (this->getInput(0) == this->getInput(1)) {
            this->setOutput(0, 1);
//            Serial.println("Equal");
        } else {
            this->setOutput(0, 0);
//            Serial.println("Not Equal");
        }
    }
}