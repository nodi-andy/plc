#include "interval.h"

Interval::Interval() {
}

// init the node
void Interval::setup() {
    title = "Interval";
    desc = "Read input";

    if (props["properties"].containsKey("ton")) {
      if (props["properties"]["ton"].as<std::string>().length() > 0 ) {
        defaultTOn = props["properties"]["ton"].as<int>() * 1000;
      }
    }

    if (props["properties"].containsKey("toff")) {
      if (props["properties"]["toff"].as<std::string>().length() > 0 ) {
        defaultTOff = props["properties"]["toff"].as<int>() * 1000;
      }
    }

    defaultPressed = 1;
    if (props["properties"].containsKey("pressed")) {
      defaultPressed = props["properties"]["pressed"].as<int>();
    }

    defaultDown = 1;
    if (props["properties"].containsKey("down")) {
      defaultDown = props["properties"]["down"].as<int>();
    }

    defaultReleased = 0;
    if (props["properties"].containsKey("released")) {
      defaultReleased = props["properties"]["released"].as<int>();
    }

    defaultUp = 0;
    if (props["properties"].containsKey("up")) {
      defaultUp = props["properties"]["up"].as<int>();
    }

    state = defaultUp;

    Serial.print(">>> Setup Interval");
    addInput("ton");
    addInput("toff");
    addOutput("output");
    lastTick = micros();
}

int Interval::onExecute() {
  int ret = 0;
  int newState = state;
  output = 0;
  int ton = defaultTOn;
  int toff = defaultTOff;
  int now = micros();
//    input = getInput(0);
  if (state == 0 && now - lastTick >= toff) {
      lastTick = now;
      output = &defaultUp;
      Serial.print("Interval EdgeUp: ");
      Serial.println(newState);
      newState = 1;
  } else if (state == 1 && now - lastTick >= ton) {
      lastTick = now;
      output = &defaultDown;
      Serial.print("Interval EdgeDown: ");
      Serial.println(newState);
      newState = 0;
  } else if (state == 0 && now - lastTick < toff) {
      output = &defaultReleased;
  } else if (state == 1 && now - lastTick < ton) {
      output = &defaultPressed;
  }
/*
    if (newState == 0 && state == 0) {
      output = &defaultPressed;
    } if (newState == 0 && state == 1) {

    } if (newState == 1 && state == 1) {
      output = &defaultReleased;
    } if (newState == 1 && state == 0) {

    }*/

  ret = (state != newState);
  state = newState;

  setOutput(0, output);
  return ret;
}