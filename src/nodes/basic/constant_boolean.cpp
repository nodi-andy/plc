#include "constant_boolean.h"

BasicBoolean::BasicBoolean() {
    this->setup();
}

// init the node
void BasicBoolean::setup() {
    this->title = "ConstantBoolean";
    this->name = "ConstantBoolean";
    this->desc = "ConstantBoolean";
    if(props["properties"].containsKey("value") > 0 ) {
      value = props["properties"]["value"].as<bool>();
    }
    addOutput("value");
}

void BasicBoolean::onExecute() {
    setOutput(0, value);
}