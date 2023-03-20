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

    Serial.print("> Setup Button, PORT: ");
    Serial.println(port);
    addInput("input");
    addOutput("output");
    Serial.println("> Button setup done.");
}

void Button::onExecute() {
  input = getInput(0);
  if (!input) {
    input = &defaultOutput;
  }

  if (port >= 0) {
    if (digitalRead(port) == 0) {
      output = input;
      Serial.println("Button pressed");
    }
    else
      output = 0;
    setOutput(0, output);
  }
}