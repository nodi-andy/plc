#include "button.h"

Button::Button(int portNr) {
  if (portNr >= 0) port = portNr;
}

// init the node
void Button::setup() {
    title = "Button";
    desc = "Read input";
    /*JsonObject jsonProp = props["properties"];

    // Iterate through the properties object
    for (JsonPair property : props["properties"].as<JsonObject>()) {
      JsonObject propObj = property.value().as<JsonObject>();
      const char* propertyName = property.key().c_str();
      
      // Call your addInput function with propertyName
      Serial.print("Adding property: ");
      Serial.println(propertyName);
      addProp(propertyName);
      vals[propertyName] = props["properties"][propertyName]["value"].as<int>();
    }*/

    port = getProp("port", "value");
    if (port >= 0) {
      pinMode(port, INPUT);
      pinMode(port, INPUT_PULLUP);
    }

    state = digitalRead(port);

    Serial.print(">>> Setup Button, PORT: ");
    Serial.println(port);
}

int Button::onExecute() {
  bool updateOutput = false;
  bool updateVal = false;
  output = NULL;
  if (port >= 0) {

    value = 1;
    if (hasInput("state")) {
      setProp("state", "value", getInput("state"));
      clearInput("state");
    }
    int newState = digitalRead(port) || getProp("state");
    //Serial.print("New state: ");
    //Serial.println(newState);
    if (state == newState) return false;

    if (newState == 0) {
      //output = &vals["press"];
      setProp("state", "value", getProp("press", "value"));
      setProp("state", "outValue", getProp("press", "value"));
      Serial.println("Button state EdgeDown: ");
      updateOutput = true;
    }

    if (newState == 1) {
      //output = &vals["release"];
      setProp("state", "value", getProp("release", "value"));
      setProp("state", "outValue", getProp("release", "value"));
      Serial.println("Button state EdgeUp: ");
      updateOutput = true;
    }
    state = newState;
  }
  
  if (updateOutput) {
    //setOutput("state", output);
    Serial.print("Button output: ");
    Serial.println(getProp("state", "value"));
  }
  return true;
}