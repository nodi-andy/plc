#include "led.h"

LED::LED() {
}

// init the node
void LED::setup() {
    title = "LED";
    name = "LED";
    desc = "Show value of input";

    if (props["properties"].containsKey("port")) {
      port = props["properties"]["port"].as<int>();
      if (port >= 0) pinMode(port, OUTPUT);
    }
    if (props["properties"].containsKey("value")) {
      value = props["properties"]["value"].as<int>();
    }
    state = newstate = value;
    addInput("input");
}

int LED::onExecute() {
    int ret = 0;
    int* input = getInput(0);
    if (input) {
      newstate = *input;
    } else {
      newstate = value;
    }
    digitalWrite(port, newstate);
    ret = (newstate != state);
    if (ret) {
      Serial.print("LED: ");
      Serial.println(newstate);
    }
    state = newstate;
    return ret;
}