#include "button.h"

Button::Button(int portNr) {
  if (portNr >= 0) port = portNr;
}

// init the node
void Button::setup() {
    title = "Button";
    desc = "Read input";

    if (props["properties"].containsKey("port")) {
      port = props["properties"]["port"].as<int>();
      if (port >= 0) {
        pinMode(port, INPUT);
        pinMode(port, INPUT_PULLUP);
      }
    }

    defaultPressed = 1;
    if (props["properties"].containsKey("pressed")) {
      defaultPressed = props["properties"]["pressed"].as<int>();
    }

    defaultReleased = 0;
    if (props["properties"].containsKey("released")) {
      defaultReleased = props["properties"]["released"].as<int>();
    }

    Serial.print("> Setup Button, PORT: ");
    Serial.println(port);
    addInput("input");
    addOutput("output");
    Serial.println("> Button setup done.");
}

void Button::onExecute() {
  output = 0;
  if (port >= 0) {
    input = getInput(0);
    if (input) {
      if (digitalRead(port) == 0) {
        output = input;
      } else {
        output = 0;
      }
    } else {
      if (digitalRead(port) == 0) {
        output = &defaultPressed;
      } else {
        output = &defaultReleased;
      }
    }
  }
  setOutput(0, output);
}