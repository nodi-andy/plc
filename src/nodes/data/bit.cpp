#include "bit.h"

Bit::Bit() {
}

// init the node
void Bit::setup() {
    title = "Bit";
    name = "Toggle";
    desc = "Show value of input";

    /*if (props["properties"].containsKey("port")) {
      port = props["properties"]["port"].as<int>();
      if (port >= 0) pinMode(port, OUTPUT);
    }
    if (props["properties"].containsKey("value")) {
      value = props["properties"]["value"].as<int>();
    }
    addInput("set");
    addInput("clear");
    addInput("toggle");
    addOutput("v");*/
}

int Bit::onExecute() {
    int ret = 0;
    int inputSet = getInput("set");
    if (inputSet != INT_MAX) {
        newvalue = 1;
        setInput("set", INT_MAX);
    }

    int inputClear = getInput("clear");
    if (inputClear != INT_MAX) {
        newvalue = 0;
        setInput("clear", INT_MAX);
    }

    int inputToggle = getInput("toggle");
    if (inputToggle != INT_MAX) {
        newvalue = !value;
        setInput("toggle", INT_MAX);
    }
    
    if (port) {
      digitalWrite(port, value ? HIGH : LOW);
    }
    ret = (value != newvalue);
    value = newvalue;
    if (ret) {
        setOutput("v", value);
    }
    return 0;
}