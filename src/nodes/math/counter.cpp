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
    for( const auto& inputObj : props["inputs"].as<JsonArray>() ) {
        Serial.print("Counter input:");
        Serial.println(inputObj["name"].as<std::string>().c_str());
        addInput(inputObj["name"].as<std::string>());
    }

    for( const auto& inputObj : props["outputs"].as<JsonArray>() ) {
        Serial.println(inputObj["name"].as<std::string>().c_str());
        addOutput(inputObj["name"].as<std::string>());
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
        setOutput("n", &value);
    }
    return update;
}
