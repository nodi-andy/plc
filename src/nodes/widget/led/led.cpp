#include "led.h"

LED::LED() {
}

// init the node
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
 // Serial.printf("[LED exec]\n");

  if (hasInput("port")) {
    setProp("port", "value", getInput("port"));
    pinMode(getProp("port"), OUTPUT);
    clearInput("port");
    Serial.printf("[LED:port_changed] : %d\n", getInput("port"));
  }

  if (hasInput("state")) {
    setProp("state", "value", getInput("state"));
    setProp("state", "outValue", getInput("state"));
    clearInput("state");

    if (port) digitalWrite(port, getProp("state"));
    Serial.printf("LED state: %d\n", getProp("state"));
    return true;
  }
  return false;
}