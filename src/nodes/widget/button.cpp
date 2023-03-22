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

    defaultDown = 1;
    if (props["properties"].containsKey("down")) {
      defaultDown = props["properties"]["down"].as<int>();
    }

    defaultReleased = 0;
    if (props["properties"].containsKey("released")) {
      defaultReleased = props["properties"]["released"].as<int>();
    }

    defaultUp = 0;
    if (props["properties"].containsKey("up")) {
      defaultUp = props["properties"]["up"].as<int>();
    }

    state = defaultUp;

    Serial.print(">>> Setup Button, PORT: ");
    Serial.println(port);
    addInput("input");
    addOutput("output");
    Serial.println(">>> Button setup done.");
}

void Button::onExecute() {
  output = 0;
  if (port >= 0) {
    input = getInput(0);

    int newState = digitalRead(port);
    if (input) {
      if (newState == 0 && state == 0 && defaultPressed) {
        output = input;
      } if (newState == 0 && state == 1 && defaultDown) {
        output = input;
        Serial.print("Button EdgeDown: ");
        Serial.println(*output);
      } if (newState == 1 && state == 0 && defaultUp) {
        output = input;
      } if (newState == 1 && state == 1 && defaultReleased) {
        output = input;
        Serial.print("Button EdgeUp: ");
        Serial.println(*output);
      }
    } else {
      if (newState == 0 && state == 0) {
        output = &defaultPressed;
      } if (newState == 0 && state == 1) {
        output = &defaultDown;
        Serial.print("Button EdgeDown: ");
        Serial.println(*output);
      } if (newState == 1 && state == 1) {
        output = &defaultReleased;
      } if (newState == 1 && state == 0) {
        output = &defaultUp;
        Serial.print("Button EdgeUp: ");
        Serial.println(*output);
      }
    }
    state = newState;

  }
  setOutput(0, output);
}