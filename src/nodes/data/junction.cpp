#include "junction.h"

Junction::Junction() {
}

// init the node
void Junction::setup() {
    title = "Junction";
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
    addOutput("d");
}

int Junction::onExecute() {
    int* input = getInput(0);
    setOutput(0, input);
    return 0;
}