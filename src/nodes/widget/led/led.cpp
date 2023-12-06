#include "led.h"

LED::LED() {
}

void LED::setup() {
    title = "LED";
    name = "LED";
    desc = "Show value of input";
    Serial.printf("LED setup: port = %d\n", getProp("port"));

    port = getProp("port");

    if (port >= 0) {
      pinMode(getProp("port"), OUTPUT);
      digitalWrite(getProp("port"), getProp("state"));
      clearInput("state");
      clearInput("port");
      Serial.printf("[LED:setup] : %d, %d\n", getInput("port"), INT_MAX);

    }
}

int LED::onExecute() {
  if (hasInput("port")) {
    setProp("port", "value", getInput("port"));
    pinMode(getProp("port"), OUTPUT);
    clearInput("port");
    Serial.printf("[LED:port_changed] : %d\n", getProp("port"));
  }

  if (hasInput("state")) {
    setProp("state", "value", getInput("state"));
    setProp("state", "outValue", getInput("state"));
    clearInput("state");

    if (getProp("port")) digitalWrite(getProp("port"), getProp("state"));
    Serial.printf("LED state: %d\n", getProp("state"));
    return true;
  }
  return false;
}