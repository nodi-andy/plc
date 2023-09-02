#include "router.h"

Router::Router() {
    setup();
}

// init the node
void Router::setup() {
    title = "Selector";
    desc = "Read input";
    name = "control/filter";

    // Iterate through the properties object
    for (JsonPair property : props["properties"].as<JsonObject>()) {
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

}

int Router::onExecute() {
    bool update = false;
    for (auto& input : inputs) {
      if (input.second) {
        update = true;
        props["properties"][input.first] = *(input.second);
      }
      input.second = nullptr;
    }

    if (update) {
        if (props["properties"]["in"] == props["properties"]["pass"]) {
            value = props["properties"]["in"].as<int>();
            setOutput("out", &value);
            Serial.print("Router: output ");
            Serial.println(value);
        }
    }
    return 0;
}