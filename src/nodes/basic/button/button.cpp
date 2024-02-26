#include "button.h"

Button::Button(int portNr) {
  if (portNr >= 0) port = portNr;
}

// init the node
void Button::setup() {
    title = "Button";
    desc = "Read input";
}

vector<string> Button::run() {
  vector<string> ret;
  if (hasInput("port")) {
    setValue("port", getInput("port"));
    port = getValue("port");
    pinMode(port, INPUT);
    pinMode(port, INPUT_PULLUP);
    clearInput("port");
    Serial.printf("[Button:port_changed] : %d\n", getValue("port"));
  }
  port = getValue("port");

  if (port < 0 || port == INT_MAX) return ret;

  if (hasInput("state")) {
    setValue("state", getInput("state"));
    clearInput("state");
  }

  int newState = !digitalRead(port);
  //Serial.printf("Button port: %d, %d", port, newState);

  if (state == newState) return ret;
  //Serial.printf("New state: %d", newState);

  if (newState == 1) {
    setValue("state", 1);
    setOutput("state", getValue("press"));
    Serial.println("Button state EdgeDown: ");
    ret.push_back("state");
  }

  if (newState == 0) {
    setValue("state", 0);
    setOutput("state", getValue("release"));
    Serial.println("Button state EdgeUp: ");
    ret.push_back("state");
  }
  state = newState;
  return ret;
}