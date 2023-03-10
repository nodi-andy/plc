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
      if (port >= 0) pinMode(port, INPUT);
    }

    Serial.print("PORT: ");
    Serial.println(port);
    addOutput("value");
    Serial.println("-> Button setup done.");
}

void Button::onExecute() {
  if (port >= 0) {
    if (digitalRead(port) == 0)
      value = 1;
    else
      value = 0;
    //if (value == 0)  Serial.println("Button pressed");
    setOutput(0, value);
  }
}