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
    defaultPressing = 0;
    defaultReleased = 0;
    defaultReleasing = 0;

    if (jsonProp.containsKey("pressed")) {
      if (jsonProp["pressed"].as<std::string>().length() > 0 ) {
        defaultPressedVal = jsonProp["pressed"].as<int>();
        defaultPressed = &defaultPressedVal;
      } else {
        defaultPressed = 0;
      }
    }

    if (jsonProp.containsKey("pressing")) {
      if (jsonProp["pressing"].as<std::string>().length() > 0 ) {
        defaultDownVal = jsonProp["pressing"].as<int>();
        defaultPressing = &defaultDownVal;
      } else {
        defaultPressing = 0;
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

    if (jsonProp.containsKey("releasing")) {
      if (jsonProp["releasing"].as<std::string>().length() > 0 ) {
        defaultUpVal = jsonProp["releasing"].as<int>();
        defaultReleasing = &defaultUpVal;
      } else {
        defaultReleasing = 0;
      }
    }

    state = digitalRead(port);

    Serial.print(">>> Setup Button, PORT: ");
    Serial.println(port);
    addInput("a");
    addOutput("v");
    Serial.println(">>> Button setup done.");
}

int Button::onExecute() {
  bool update = false;
  output = NULL;
  if (port >= 0) {
    input = getInput("a");

    int newState = digitalRead(port);
    if (input) {
      if (newState == 0 && state == 0 && defaultPressed && *defaultPressed) {
        output = input;
      } if (newState == 0 && state == 1 && defaultPressing && *defaultPressing) {
        output = input;
        Serial.print("Button conduct EdgeDown: ");
        Serial.println(*output);
      } if (newState == 1 && state == 0 && defaultReleasing && *defaultReleasing) {
        output = input;
      } if (newState == 1 && state == 1 && defaultReleased && *defaultReleased) {
        output = input;
        Serial.print("Button conduct EdgeUp: ");
        Serial.println(*output);
      }
    } else {
      if (newState == 0 && state == 0) {
        output = defaultPressed;
      } if (newState == 0 && state == 1) {
        output = defaultPressing;
        Serial.println("Button state EdgeDown: ");
      } if (newState == 1 && state == 1) {
        output = defaultReleased;
      } if (newState == 1 && state == 0) {
        output = defaultReleasing;
        Serial.println("Button state EdgeUp: ");
      }
    }
    update = (state != newState);
    state = newState;
  }
  if (update) {
    setOutput("v", output);
    Serial.println("Button output ");
  }
  return update;
}