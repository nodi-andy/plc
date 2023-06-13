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

    defaultPressVal = 0;
    defaultReleaseVal = 0;
    defaultPress = 0;
    defaultRelease = 0;


    if (jsonProp.containsKey("press")) {
      std::string jsonVal = jsonProp["press"].as<std::string>();
      if ( jsonVal.length() > 0 && jsonVal != "null") {
        defaultPressVal = jsonProp["press"].as<int>();
        defaultPress = &defaultPressVal;
      } else {
        defaultPress = 0;
      }
    }

    if (jsonProp.containsKey("release")) {
      std::string jsonVal = jsonProp["release"].as<std::string>();
      if ( jsonVal.length() > 0 && jsonVal != "null") {
        defaultReleaseVal = jsonProp["release"].as<int>();
        defaultRelease = &defaultReleaseVal;
      } else {
        defaultRelease = 0;
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
  bool updateOutput = false;
  bool updateVal = false;
  output = NULL;
  if (port >= 0) {

    value = 1;
    int newState = digitalRead(port);
    for (auto& input : inputs) {
      if (input.second) {
        Serial.print("Button.");
        Serial.print(input.first.c_str());
        Serial.print(": ");
        Serial.println(*input.second);
        inputVals[input.first] = input.second;
        input.second = nullptr;
      }
    }
    if (state == newState) return false;


    if ( inputVals.count("in") ) {
      updateOutput = true;
      if (newState == 0) {
        Serial.println("Button conduct EdgeDown: ");
        if (defaultPress && *defaultPress) {
          output = inputVals["in"];
        } else {
          output = &NULL_DATA;
        }
      } 
      if (newState == 1) {
        Serial.println("Button conduct EdgeUp: ");
        if (defaultRelease && *defaultRelease) {
          output = inputVals["in"];
        } else {
          output = &NULL_DATA;
        }
      } 
    } else {
      if (newState == 0) {
        output = defaultPress;
        Serial.println("Button state EdgeDown: ");
        updateOutput = true;
      } 
      if (newState == 1) {
        output = defaultRelease;
        Serial.println("Button state EdgeUp: ");
        updateOutput = true;
      }
    }
    state = newState;
  }
  if (updateOutput) {
    setOutput("v", output);
    Serial.print("Button output: ");
    if (output) {
      Serial.println(*output);
    }
  }
  return true;
}