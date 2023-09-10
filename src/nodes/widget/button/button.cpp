#include "button.h"

Button::Button(int portNr) {
  if (portNr >= 0) port = portNr;
}

// init the node
void Button::setup() {
    title = "Button";
    desc = "Read input";
    JsonObject jsonProp = props["properties"];

    // Iterate through the properties object
    for (JsonPair property : props["properties"].as<JsonObject>()) {
      JsonObject propObj = property.value().as<JsonObject>();
      const char* propertyName = property.key().c_str();
      
      // Call your addInput function with propertyName
      Serial.print("Adding property: ");
      Serial.println(propertyName);
      addProp(propertyName);
      vals[propertyName] = props["properties"][propertyName]["value"].as<int>();
    }

    port = vals["port"];
    if (port >= 0) {
      pinMode(port, INPUT);
      pinMode(port, INPUT_PULLUP);
    }

    state = digitalRead(port);

    Serial.print(">>> Setup Button, PORT: ");
    Serial.println(port);

    Serial.println(">>> Button setup done.");
}

int Button::onExecute() {
  bool updateOutput = false;
  bool updateVal = false;
  output = NULL;
  if (port >= 0) {

    value = 1;
    int newState = digitalRead(port);

    if (state == newState) return false;


    /*if ( inputVals.count("in") ) {
      updateOutput = true;
      if (newState == 0) {
        Serial.println("Button conduct EdgeDown: ");
        if (defaultPress && *defaultPress) {
          output = inputVals["in"][0];
        } else {
          output = &NULL_DATA;
        }
      } 
      if (newState == 1) {
        Serial.println("Button conduct EdgeUp: ");
        if (defaultRelease && *defaultRelease) {
          output = inputVals["in"][0];
        } else {
          output = &NULL_DATA;
        }
      } 
    } else */{
      if (newState == 0) {
        output = &vals["press"];
        Serial.println("Button state EdgeDown: ");
        updateOutput = true;
      } 
      if (newState == 1) {
        output = &vals["release"];
        Serial.println("Button state EdgeUp: ");
        updateOutput = true;
      }
    }
    state = newState;
  }
  
  if (updateOutput) {
    setOutput("state", output);
    Serial.print("Button output: ");
    if (output) {
      Serial.println(*output);
    }
  }
  return true;
}