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
    addOutput("value");
}

void BasicConst::onExecute() {
    output = &value;
    setOutput(0, output);
}