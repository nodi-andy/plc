#include "button.h"

Button::Button(int portNr) {
  if (portNr >= 0) port = portNr;
}

// init the node
void Button::setup() {
    title = "Button";
    desc = "Read input";
    JsonObject jsonProp = props["properties"];

    if (jsonProp.containsKey("port")) {
      if (jsonProp["port"].as<std::string>().length() > 0 ) {
        port = jsonProp["port"].as<int>();
        if (port >= 0) {
          pinMode(port, INPUT);
          pinMode(port, INPUT_PULLUP);
        }
      }
    }

    defaultPressedVal = 0;
    defaultDownVal = 0;
    defaultReleasedVal = 0;
    defaultUpVal = 0;
    defaultPressed = 0;
    defaultDown = 0;
    defaultReleased = 0;
    defaultUp = 0;

    if (jsonProp.containsKey("pressed")) {
      if (jsonProp["pressed"].as<std::string>().length() > 0 ) {
        defaultPressedVal = jsonProp["pressed"].as<int>();
        defaultPressed = &defaultPressedVal;
      } else {
        defaultPressed = 0;
      }
    }

    if (jsonProp.containsKey("down")) {
      if (jsonProp["down"].as<std::string>().length() > 0 ) {
        defaultDownVal = jsonProp["down"].as<int>();
        defaultDown = &defaultDownVal;
      } else {
        defaultDown = 0;
      }
    }

    if (jsonProp.containsKey("released")) {
      if (jsonProp["released"].as<std::string>().length() > 0 ) {
        defaultReleasedVal = jsonProp["released"].as<int>();
        defaultReleased = &defaultReleasedVal;
      } else {
        defaultReleased = 0;
      }
    }

    if (jsonProp.containsKey("up")) {
      if (jsonProp["up"].as<std::string>().length() > 0 ) {
        defaultUpVal = jsonProp["up"].as<int>();
        defaultUp = &defaultUpVal;
      } else {
        defaultUp = 0;
      }
    }

    state = 0;

    Serial.print(">>> Setup Button, PORT: ");
    Serial.println(port);
    addInput("input");
    addOutput("output");
    Serial.println(">>> Button setup done.");
}

int Button::onExecute() {
  int ret = 0;
  output = 0;
  if (port >= 0) {
    input = getInput(0);

    int newState = digitalRead(port);
    if (input) {
      if (newState == 0 && state == 0 && defaultPressed && *defaultPressed) {
        output = input;
      } if (newState == 0 && state == 1 && defaultDown && *defaultDown) {
        output = input;
        Serial.print("Button EdgeDown: ");
        Serial.println(*output);
      } if (newState == 1 && state == 0 && defaultUp && *defaultUp) {
        output = input;
      } if (newState == 1 && state == 1 && defaultReleased && *defaultReleased) {
        output = input;
        Serial.print("Button EdgeUp: ");
        Serial.println(*output);
      }
    } else {
      if (newState == 0 && state == 0) {
        output = defaultPressed;
      } if (newState == 0 && state == 1) {
        output = defaultDown;
        if (output) {
          Serial.print("Button EdgeDown: ");
          Serial.println(*output);
        }
      } if (newState == 1 && state == 1) {
        output = defaultReleased;
      } if (newState == 1 && state == 0) {
        output = defaultUp;
        if (output) {
          Serial.print("Button EdgeUp: ");
          Serial.println(*output);
        }
      }
    }
    ret = (state != newState);
    state = newState;
  }
  setOutput(0, output);
  return ret;
}