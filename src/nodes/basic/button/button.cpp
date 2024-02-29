#include "button.h"

Button::Button() {
}

// init the node
void Button::setup() {
}

vector<string> Button::run() {
  vector<string> ret;
  if (hasInput("port")) {
    setValue("port", getInput("port"));
    clearInput("port");
    Serial.printf("[Button:port_changed] : %d\n", getValue("port"));
  }
  port = getValue("port");
  pinMode(port, INPUT);
  pinMode(port, INPUT_PULLUP);

  //Serial.printf("Button port: %d ", port);
  if (port < 0 || port == INT_MAX) return ret;

  if (hasInput("state")) {
    setValue("state", getInput("state"));
    clearInput("state");
  }

  int newState = !digitalRead(port);
  //Serial.printf("newState: %d \n", newState);

  if (state == newState) return ret;
  //Serial.printf("New state: %d", newState);

  if (newState == 1) {
    setValue("state", 1);
    setOutput("value", 1);
    Serial.printf("Button state EdgeDown: %d\n", hasOutput("value"));
    ret.push_back("state");
  }

  if (newState == 0) {
    setValue("state", 0);
    setOutput("value", 0);
    Serial.println("Button state EdgeUp: ");
    ret.push_back("state");
  }
  state = newState;
  return ret;
}