#include "toggle.h"

Toggle::Toggle(int portNr) {
    port = portNr;
    pinMode(port, OUTPUT);
    setup();
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
      value = props["properties"]["value"].as<bool>();
    }
    if (props.containsKey("inputs")) {
        Serial.print("TOGGLE: ");
        Serial.println(props["inputs"][0]["link"].as<int>());
      isNotConnected = props["inputs"][0]["link"].isNull();
    }
    addInput("value1");
}

void Toggle::onExecute() {
    if (isNotConnected == false) {
        value = getInput(0);
    }
    digitalWrite(port, value ? HIGH : LOW);
}