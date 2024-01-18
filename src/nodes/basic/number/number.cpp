#include "number.h"

Number::Number() {
}

// init the node
void Number::setup() {
    title = "Number";
    name = "Toggle";
    desc = "Show value of input";

    // Iterate through the properties object
    /*for (JsonPair property : props["properties"].as<JsonObject>()) {
      JsonObject propObj = property.value().as<JsonObject>();
      
      // Check if the "input" property is true
      if (propObj["input"] == true) {
          const char* propertyName = property.key().c_str();
          
          // Call your addInput function with propertyName
          Serial.print("Adding input for property: ");
          Serial.println(propertyName);
          addInput(propertyName);
      }
    }

    // Iterate through the properties object
    for (JsonPair property : props["properties"].as<JsonObject>()) {
        JsonObject propObj = property.value().as<JsonObject>();
        
        // Check if the "input" property is true
        if (propObj["output"] == true) {
            const char* propertyName = property.key().c_str();
            
            // Call your addInput function with propertyName
            Serial.print("Adding output for property: ");
            Serial.println(propertyName);
            addOutput(propertyName);
        }
    }

    if (props["properties"].containsKey("value")) {
      value = props["properties"]["value"]["value"].as<int>();
    }*/

    newvalue = value;
}

int Number::onExecute() {
    int ret = 0;
    bool update = false;
    if (getInput("set")) {
        newvalue = getInput("set");
        setInput("set", INT_MAX);
        update = true;
    }
    if (getInput("read")) {
        setInput("read", INT_MAX);
        update = true;
    }

    ret = (value != newvalue);
    value = newvalue;
    if (update) {
        Serial.print("Number changed: ");
        Serial.println(value);
        setOutput("get", value);
    }
    return ret;
}