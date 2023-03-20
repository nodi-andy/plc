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
    addInput("input");
}

void Toggle::onExecute() {
    int* input = getInput(0);
    if (input) {
      //Serial.print("Toggle: ");
      //Serial.println(*input);
      value = *input;
      digitalWrite(port, value ? HIGH : LOW);
    } else {
      digitalWrite(port, LOW);
    }
}