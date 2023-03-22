#include "bit.h"

Bit::Bit() {
}

// init the node
void Bit::setup() {
    title = "Bit";
    name = "Toggle";
    desc = "Show value of input";

    if (props["properties"].containsKey("port")) {
      port = props["properties"]["port"].as<int>();
      if (port >= 0) pinMode(port, OUTPUT);
    }
    if (props["properties"].containsKey("value")) {
      value = props["properties"]["value"].as<int>();
    }
    addInput("set");
    addInput("reset");
    addOutput("d");
}

void Bit::onExecute() {
    int* inputSet = getInput(0);
    if (inputSet) {
      if (*inputSet) {
        value = 1;
      }
    }
    int* inputReset = getInput(1);
    if (inputReset) {
      if (*inputSet) {
        value = 0;
      }
    }
    if (port) {
      digitalWrite(port, value ? HIGH : LOW);
    }
    setOutput(0, &value);
}