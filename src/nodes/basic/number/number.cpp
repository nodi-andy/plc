#include "number.h"

Number::Number() {
}

// init the node
void Number::setup() {
    title = "Number";
    name = "Toggle";

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

    //newvalue = value;
}

vector<string> Number::run() {
    vector<string> ret;
    bool update = false;
    if (getInput("set")) {
        setValue("value", getInput("set"));
        update = true;
        ret.push_back("value");
        Serial.print("Number changed: ");
        Serial.println(getValue("value"));
    }

    if (getInput("read")) {
        update = true;
    }

    return ret;
}