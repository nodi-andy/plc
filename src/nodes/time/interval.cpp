#include "interval.h"

Interval::Interval() {
}

// init the node
void Interval::setup() {
    title = "Interval";
    desc = "Read input";

    defaultPressed = 0;
    defaultReleased = 0;
    
    /*if (props["properties"].containsKey("ton")) {
      if (props["properties"]["ton"].as<std::string>().length() > 0 ) {
        defaultTOn = props["properties"]["ton"]["value"].as<int>() * 1000;
      }
    }

    if (props["properties"].containsKey("toff")) {
      if (props["properties"]["toff"].as<std::string>().length() > 0 ) {
        defaultTOff = props["properties"]["toff"]["value"].as<int>() * 1000;
      }
    }

    defaultPressed = 1;
    if (props["properties"].containsKey("press")) {
      defaultPressed = props["properties"]["press"]["value"].as<int>();
    }

    defaultReleased = 0;
    if (props["properties"].containsKey("release")) {
      defaultReleased = props["properties"]["release"]["value"].as<int>();
    }*/

    state = defaultReleased;
    ton = defaultTOn;
    toff = defaultTOff;
    Serial.print(">>> Setup Interval");
    addInput("ton");
    addInput("toff");
    addOutput("state");
    lastTick = micros();
}

int Interval::onExecute() {
  int now = micros();

  bool update = false;
  if (getInput("ton")) {
      ton = getInput("ton");
      setInput("ton", INT_MAX);
  }

  if (getInput("toff")) {
      ton = getInput("toff");
      setInput("toff", INT_MAX);
  }

  //Serial.print("Interval run: ");
  //Serial.println(now - lastTick);

  if (state == 0 && now - lastTick > ton) {
    newstate = 1;
    lastTick = now;
    //Serial.println("Interval output High");
  } else if (state == 1 && now - lastTick > toff) {
    newstate = 0;
    lastTick = now;
    //Serial.println("Interval output Low");
  }

  if (newstate == 0 && state == 1) {
    value = defaultPressed;
    //Serial.println("Button state EdgeDown: ");
  } if (newstate == 1 && state == 0) {
    value = defaultReleased;
    //Serial.println("Button state EdgeUp: ");
  }

  update = (state != newstate);
  state = newstate;
  if (update) {
    setOutput("state", value);
    Serial.print("Interval output: ");
  }
  return 0;
}