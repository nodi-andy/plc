#include "const.h"

BasicConst::BasicConst() {
    this->setup();
}

// init the node
void BasicConst::setup() {
    this->title = "Const";
    this->name = "Const";
    this->desc = "Const";
    if(props["properties"].containsKey("value") > 0 ) {
      value = props["properties"]["value"].as<int>();
    }
    addInput("input");
    addOutput("value");
}

void BasicConst::onExecute() {
    int* input = getInput(0);
    if (input) {
        value = *input;
        output = input;
    } else {
        output = &value;
    }
    /*Serial.print("Value: ");
    Serial.println(*output);*/
    setOutput(0, output);
}