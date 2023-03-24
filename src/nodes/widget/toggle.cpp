#include "toggle.h"

Toggle::Toggle() {
}

// init the node
void Toggle::setup() {
    title = "Toggle";
    name = "Toggle";
    desc = "Show value of input";

    if (props["properties"].containsKey("port")) {
      port = props["properties"]["port"].as<int>();
      if (port >= 0) pinMode(port, OUTPUT);
    }
    if (props["properties"].containsKey("value")) {
      value = props["properties"]["value"].as<int>();
    }
    state = pstate = value;
    addInput("input");
}

int Toggle::onExecute() {
    int ret = 0;
    int* input = getInput(0);
    if (input) {
      state = *input;
    } else {
      state = value;
    }
    digitalWrite(port, state);
    ret = (pstate != state);
    if (ret) {
      Serial.print("Toggle: ");
      Serial.println(state);
    }
    pstate = state;
    return ret;
}