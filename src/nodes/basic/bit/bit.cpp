#include "bit.h"

Bit::Bit() {
}

vector<string> Bit::run() {
  vector<string> ret;
  if (hasInput("port")) {
    setValue("port", getValue("port"));
    pinMode(getValue("port"), OUTPUT);
    clearInput("port");
    Serial.printf("[Bit:port_changed] : %d\n", getValue("port"));
  }
  if (getValue("port") > -1) pinMode(getValue("port"), OUTPUT);
  //Serial.printf("Bit port %d\n", getValue("port"));

  if (hasInput("value")) {
    setValue("value", getInput("value"));

    Serial.printf("Bit (port:%d) value: %d\n", getValue("port"), getValue("value"));
    if (getValue("port") > -1) digitalWrite(getValue("port"), getValue("value"));
    setOutput("value", getInput("value"));
    clearInput("value");
    ret.push_back("value");
  }


  if (hasInput("toggle")) {
    int nextValue = getValue("value") == 1 ? 0 : 1;
    setValue("value", nextValue);
    setOutput("value", nextValue);
    clearInput("toggle");
    Serial.printf("Bit (%d) value: %d %d\n", getValue("port"), getValue("value"), nextValue);
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