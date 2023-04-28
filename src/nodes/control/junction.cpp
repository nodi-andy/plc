#include "junction.h"

Junction::Junction() {
}

// init the node
void Junction::setup() {
    title = "Junction";
    name = "Toggle";
    desc = "Show value of input";
    multipleInput = true;

    addOutput("d");
}

int Junction::onExecute() {
    for (auto& input : inputs) {
      if (input.second) {
        //Serial.print(">> Junction :");
        //Serial.println(*input);
        setOutput(input.first, input.second);
        inputs.clear();
        return 0;
      }
    }
    setOutput(0, 0);
    inputs.clear();
    return 0;
}