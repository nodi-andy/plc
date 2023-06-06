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
    for( const auto& inputObj : props["inputs"].as<JsonArray>() ) {
        Serial.println(inputObj["name"].as<std::string>().c_str());
        addInput(inputObj["name"].as<std::string>());
        inputVals[inputObj["name"].as<std::string>()] = 0;
        props["properties"][inputObj["name"]] = nullptr;
    }
    for( const auto& inputObj : props["outputs"].as<JsonArray>() ) {
        Serial.println(inputObj["name"].as<std::string>().c_str());
        addOutput(inputObj["name"].as<std::string>());
    }
    Serial.println(">>> Button setup done.");
}

int Button::onExecute() {
  bool updateGUI = false;
  bool updateOutput = false;
  bool updateVal = false;
  output = NULL;
  if (port >= 0) {

    value = 1;
    int newState = digitalRead(port);
    if (state == newState) return 0;
    for (auto& input : inputs) {
      if (input.second) {
        props["properties"][input.first] = *(input.second);
      }
      input.second = nullptr;
    }

    /*value = inputVals["in"];
    if (value && newState == 0 && defaultPressing && *defaultPressing) {
      output = &value;
      Serial.print("Button conduct EdgeDown: ");
      Serial.println(value);
    } 
    if (value && newState == 1 && defaultReleasing && *defaultReleasing) {
      output = &value;
      Serial.print("Button conduct EdgeUp: ");
      Serial.println(value);
    }*/
    if (newState == 0) {
      output = defaultPressing;
      Serial.println("Button state EdgeDown: ");
    } 
    if (newState == 1) {
      output = defaultReleasing;
      Serial.println("Button state EdgeUp: ");
    }
    updateOutput = true;
    updateGUI = true;
    state = newState;
  }
  if (updateOutput && output) {
    setOutput("v", output);
    Serial.println("Button output ");
  }
  return updateGUI;
}