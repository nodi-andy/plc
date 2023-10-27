#include "button.h"

Button::Button(int portNr) {
  if (portNr >= 0) port = portNr;
}

// init the node
void Button::setup() {
    title = "Button";
    desc = "Read input";

    port = getProp("port", "value");
    if (port >= 0) {
      pinMode(port, INPUT);
      pinMode(port, INPUT_PULLUP);
    }

    state = digitalRead(port);

    Serial.print(">>> Setup Button, PORT: ");
    Serial.println(port);
}

int Button::onExecute() {
  if (port <= 0) return false;

  if (hasInput("state")) {
    setProp("state", "value", getInput("state"));
    clearInput("state");
  }
  int newState = !digitalRead(port);
  if (state == newState) return false;
  Serial.printf("New state: %d", newState);

  if (newState == 1) {
    setProp("state", "value", 1);
    setProp("state", "outValue", getProp("press", "value"));
    Serial.println("Button state EdgeDown: ");
  }

  if (newState == 0) {
    setProp("state", "value", 0);
    setProp("state", "outValue", getProp("release", "value"));
    Serial.println("Button state EdgeUp: ");
  }
  state = newState;
  return true;
}