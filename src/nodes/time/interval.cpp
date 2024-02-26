#include "interval.h"

Interval::Interval() {
}

// init the node
void Interval::setup() {
    title = "Interval";
    desc = "Read input";

    defaultPressed = 0;
    defaultReleased = 1;
    
    state = defaultReleased;
    ton = 500;
    toff = 500;
    Serial.print("[Interval] Setup");
    lastTick = micros();
}

vector<string> Interval::run() {
  int now = micros();

  bool update = false;
  if (hasInput("ton")) {
      ton = getInput("ton");
      //setInput("ton", INT_MAX);
  }

  if (hasInput("toff")) {
      toff = getInput("toff");
      //setInput("toff", INT_MAX);
  }

  //Serial.printf("[Interval] state: %d,  diff: %d, ton %d\n", state, now - lastTick, ton * rtFactor);

  if (state == 0 && now - lastTick >= ton * rtFactor) {
    state = 1;
    lastTick = now;
    value = defaultReleased;
    update = true;

    //Serial.println("Interval output High");
  } else if (state == 1 && now - lastTick >= toff * rtFactor) {
    state = 0;
    lastTick = now;
    value = defaultPressed;
    update = true;
    //Serial.println("Interval output Low");
  }

  if (update) {
    setOutput("state", value);
    //Serial.printf("Interval output: %d\n", value);
  }
  return {};
}