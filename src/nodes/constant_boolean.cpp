#include "constant_boolean.h"

ConstantBoolean::ConstantBoolean(int port) {
    this->setup();
}

// init the node
void ConstantBoolean::setup() {
    this->title = "ConstantBoolean";
    this->name = "ConstantBoolean";
    this->desc = "ConstantBoolean";
    if(props["properties"].containsKey("value") > 0 ) {
      value = props["properties"]["value"].as<bool>();
    }
    addOutput("value");
}

void ConstantBoolean::onExecute() {
    setOutput(0, value);
}