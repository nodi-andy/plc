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
    addInput("in");
    addOutput("out");
}

int LED::onExecute() {
    int ret = 0;
    int* input = getInput("in");
    if (input) {
      newstate = *input;
      Serial.print("LED IN: ");
      Serial.println(*input);
      //setOutput("in", &newstate);
      setInput("in", NULL);
    } else {
      //newstate = value;
    }
    ret = (newstate != state);
    if (ret) {
      Serial.print("LED: ");
      Serial.println(newstate);
    }
    state = newstate;
    digitalWrite(port, state);
    return ret;
}