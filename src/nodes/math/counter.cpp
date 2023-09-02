#include "counter.h"

Counter::Counter() {
    setup();
}

// init the node
void Counter::setup() {
    title = "Counter";
    desc = "Read input";
    name = "events/counter";

    value = 0;
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

int Counter::onExecute() {
    bool update = false;
    if (getInput("inc")) {
        newvalue += *getInput("inc");
        setInput("inc", NULL);
        Serial.print("Increment: ");
        Serial.println(newvalue);
        update = true;
    }

    if (getInput("dec")) {
        newvalue -= *getInput("dec");
        setInput("dec", NULL);
        Serial.print("Decrement: ");
        Serial.println(newvalue);
        update = true;
    }

    if (getInput("set")) {
        newvalue = *getInput("set");
        setInput("set", NULL);
        update = true;
        //Serial.print("Reset");
    }
    value = newvalue;
    if (update) {
        setOutput("get", &value);
    }
    return update;
}
