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
    bool update = false;

    int ret = 0;
    for (auto& input : inputs) {
      if (input.second) {
        Serial.print("LED.");
        Serial.print(input.first.c_str());
        Serial.print(": ");
        Serial.println(*input.second);
        inputVals[input.first] = input.second;
        input.second = nullptr;
      }
    }

    if (inputVals["in"] != nullptr && newstate != *(inputVals["in"]) && *(inputVals["in"]) != INT_MAX) {
      newstate = *(inputVals["in"]);
      Serial.print("LED.targetState.changed: ");
      Serial.print(newstate);
    }
    update = (newstate != state);
    if (update) {
      Serial.print("LED: ");
      Serial.println(newstate);
    }
    state = newstate;
    digitalWrite(port, state);
    return update;
}