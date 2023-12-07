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
      Serial.printf("[Button] port: %d\n", port);
    }

    state = digitalRead(port);

}

int Button::onExecute() {
  if (hasInput("port")) {
    setProp("port", "value", getInput("port"));
    port = getProp("port");
    pinMode(port, INPUT);
    pinMode(port, INPUT_PULLUP);
    clearInput("port");
    Serial.printf("[Button:port_changed] : %d\n", getProp("port"));
  }
  port = getProp("port");

  if (port < 0 || port == INT_MAX) return false;

  if (hasInput("state")) {
    setProp("state", "value", getInput("state"));
    clearInput("state");
  }

  int newState = !digitalRead(port);
  //Serial.printf("Button port: %d, %d", port, newState);

  if (state == newState) return false;
  //Serial.printf("New state: %d", newState);

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