#include "const.h"

BasicConst::BasicConst() {
    this->setup();
}

// init the node
void BasicConst::setup() {
    this->title = "ConstantBoolean";
    this->name = "ConstantBoolean";
    this->desc = "ConstantBoolean";
    if(props["properties"].containsKey("value") > 0 ) {
      value = props["properties"]["value"].as<bool>();
    }
    addOutput("value");
}

void BasicConst::onExecute() {
    setOutput(0, value);
}