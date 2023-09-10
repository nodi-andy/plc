#include "led.h"

LED::LED() {
}

// init the node
void LED::setup() {
    title = "LED";
    name = "LED";
    desc = "Show value of input";
    
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
    if (port >= 0) pinMode(port, OUTPUT);

    newstate = vals["state"];
}

int LED::onExecute() {
    bool update = false;

    int ret = 0;

    if (getInput("state") != nullptr ) {
      if (newstate != *(getInput("state")) && *(getInput("state")) != INT_MAX) {
        newstate = *(getInput("state"));
        Serial.print("LED.targetState.changed: ");
        Serial.print(newstate);
      }
      Serial.println("LED.state.input");
      setInput("state", nullptr);
    }

    update = (newstate != vals["state"]);
    if (update) {
      Serial.print("LED: ");
      Serial.println(newstate);
      ret = 1;
    }
    
    vals["state"] = newstate;
    digitalWrite(port, vals["state"]);
    return ret;
}