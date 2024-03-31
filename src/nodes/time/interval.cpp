#include "interval.h"

Interval::Interval() {
}

// init the node
void Interval::setup() {
    state = 0;
    Serial.print("[Interval] Setup\n");
    lastTick = micros();
}

vector<string> Interval::run() {
  vector<string> ret;
  int now = micros();

  bool update = false;
  if (hasInput("enable")) {
    enable = getInput("enable");
    clearInput("enable");
    ret.push_back("enable");
    //Serial.printf("enable: %d\n", enable);
  }
  if (hasInput("ton")) {
    setValue("ton", getInput("ton"));
    Serial.printf("[Interval::ton] : %d\n", getValue("ton"));
    clearInput("ton");
    ret.push_back("ton");
  }

  if (hasInput("toff")) {
    setValue("toff", getInput("toff"));
    clearInput("toff");
    ret.push_back("toff");
  }

  //Serial.printf("[Interval] state: %d,  diff: %d, ton %d\n", state, now - lastTick, ton * rtFactor);
  if (enable == false) lastTick = now;

  if (state == 0 && now - lastTick >= getValue("ton") * rtFactor) {
    state = 1;
    lastTick = now;
    value = 0;
    update = true;
    setValue("state", 0);
    setOutput("value", 0);
    //ret.push_back("state");
    Serial.printf("Interval output High: %d\n", enable);
  } else if (state == 1 && now - lastTick >= getValue("toff") * rtFactor) {
    state = 0;
    lastTick = now;
    value = 1;
    update = true;
    setValue("state", 1);
    setOutput("value", 1);
    Serial.println("Interval output Low");
    //ret.push_back("state");
  }

  return ret;
}