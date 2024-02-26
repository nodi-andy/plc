#include "led.h"

LED::LED() {
}

void LED::setup() {
    title = "LED";
    name = "LED";
    desc = "Show value of input";

    port = getValue("port");

    if (port >= 0) {
      pinMode(getValue("port"), OUTPUT);
      digitalWrite(getValue("port"), getValue("state"));
      clearInput("state");
      clearInput("port");
      Serial.printf("[LED:setup] : %d\n", getValue("port"));
    }
}

vector<string> LED::run() {
  vector<string> ret;
  if (hasInput("port")) {
    setValue("port", getValue("port"));
    pinMode(getValue("port"), OUTPUT);
    clearInput("port");
    Serial.printf("[LED:port_changed] : %d\n", getValue("port"));
  }

  if (hasInput("value")) {
    setValue("value", getInput("value"));
    setOutput("value", getInput("value"));
    clearInput("value");

    if (getValue("port")) digitalWrite(getValue("port"), getValue("value"));
    Serial.printf("LED value: %d\n", getValue("value"));
    ret.push_back("value");
  }

  if (hasInput("toggle")) {
    int nextValue = getValue("value") == 1 ? 0 : 1;
    setValue("value", nextValue);
    setOutput("value", nextValue);
    clearInput("toggle");
    Serial.printf("LED (%d) value: %d %d\n", getValue("port"), getValue("value"), nextValue);
    if (getValue("port")) digitalWrite(getValue("port"), getValue("value"));

    ret.push_back("value");
  }
/*
  if (hasInput("set")) {
    setValue("state", "value", 1);
    clearInput("set");
  }*/

  return ret;
}