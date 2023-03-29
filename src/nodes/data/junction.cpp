#include "junction.h"

Junction::Junction() {
}

// init the node
void Junction::setup() {
    title = "Junction";
    name = "Toggle";
    desc = "Show value of input";
    multipleInput = true;

    if (props["properties"].containsKey("port")) {
      port = props["properties"]["port"].as<int>();
      if (port >= 0) pinMode(port, OUTPUT);
    }
    if (props["properties"].containsKey("value")) {
      value = props["properties"]["value"].as<int>();
    }
    addOutput("d");
}

int Junction::onExecute() {
    for (int *input : inputs) {
      if (input) {
        //Serial.print(">> Junction :");
        //Serial.println(*input);
        setOutput(0, input);
        inputs.clear();
        return 0;
      }
    }
    setOutput(0, 0);
    inputs.clear();
    return 0;
}