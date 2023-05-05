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


    if (jsonProp.containsKey("press")) {
      std::string jsonVal = jsonProp["press"].as<std::string>();
      if ( jsonVal.length() > 0 && jsonVal != "null") {
        defaultDownVal = jsonProp["press"].as<int>();
        defaultPressing = &defaultDownVal;
      } else {
        defaultPressing = 0;
      }
    }

    if (jsonProp.containsKey("release")) {
      std::string jsonVal = jsonProp["release"].as<std::string>();
      if ( jsonVal.length() > 0 && jsonVal != "null") {
        defaultUpVal = jsonProp["release"].as<int>();
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
  bool updateGUI = false;
  bool updateOutput = false;
  bool updateVal = false;
  output = NULL;
  if (port >= 0) {

    value = 1;
    for (auto& input : inputs) {
      if (input.second) {
        updateVal = true;
        inputVals[input.first] = *(input.second);
        Serial.println(*input.second);
      }
      input.second = nullptr;
    }

    int link = props["inputs"][0]["link"].isNull();
    int newState = digitalRead(port);
    if (link == false) {
      value = inputVals["a"];
      if (newState == 0 && defaultPressing && *defaultPressing) {
        output = &value;
        Serial.print("Button conduct EdgeDown: ");
        Serial.println(value);
        updateOutput = true;
        //updateGUI = true;
      } 
      if (newState == 1 && defaultReleasing && *defaultReleasing) {
        output = &value;
        Serial.print("Button conduct EdgeUp: ");
        Serial.println(value);
        updateOutput = true;
        //updateGUI = true;
      }
    } else {
      if (newState == 0 && state == 1) {
        output = defaultPressing;
        Serial.println("Button state EdgeDown: ");
        updateOutput = true;
        updateGUI = true;
      } 
      if (newState == 1 && state == 0) {
        output = defaultReleasing;
        Serial.println("Button state EdgeUp: ");
        updateOutput = true;
        updateGUI = true;
      }
      updateGUI = (state != newState);
    }
    state = newState;
  }
  if (updateOutput && output) {
    setOutput("v", output);
    Serial.println("Button output ");
  }
  return updateGUI;
}