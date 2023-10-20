#include "counter.h"

Counter::Counter() {
    setup();
}

// init the node
void Counter::setup() {
    title = "Counter";
    desc = "Read input";
    name = "events/counter";

    // Iterate through the properties object
    /*for (JsonPair property : props["properties"].as<JsonObject>()) {
      JsonObject propObj = property.value().as<JsonObject>();
      const char* propertyName = property.key().c_str();
      
      // Call your addInput function with propertyName
      Serial.print("Adding property: ");
      Serial.println(propertyName);
      addProp(propertyName);
      vals[propertyName] = props["properties"][propertyName]["value"].as<int>();
    }*/
}

int Counter::onExecute() {
    bool update = false;
    if (getInput("inc") != INT_MAX) {
        newvalue += getInput("inc");
        Serial.print("Increment: ");
        update = true;
        setInput("inc", INT_MAX);
    }

    if (getInput("dec") != INT_MAX) {
        newvalue -= getInput("dec");
        Serial.print("Decrement: ");
        update = true;
        setInput("dec", INT_MAX);
    }

    if (getInput("set") != INT_MAX) {
        newvalue = getInput("set");
        update = true;
        //Serial.print("Reset");
        setInput("set", INT_MAX);
    }
    
    vals["value"][1] = newvalue;
    if (update) {
        Serial.println(vals["value"][1]);
        setOutput("value", vals["value"][1]);
    }
    return update;
}
