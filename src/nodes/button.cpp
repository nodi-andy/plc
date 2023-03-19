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

    Serial.print("PORT: ");
    Serial.println(port);
    addOutput("value");
    Serial.println("-> Button setup done.");
}

void Button::onExecute() {
  bool isNotConnected;
  if (props.containsKey("inputs")) {
    isNotConnected = props["inputs"][0]["link"].isNull();
  }
  if (isNotConnected) input = &defaultOutput;
  else input = getInput(0);

  if (port >= 0) {
    if (digitalRead(port) == 0)
      output = input;
    else
      output = 0;
    //if (value == 0)  Serial.println("Button pressed");
    setOutput(0, output);
  }
}