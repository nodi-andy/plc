#include "router.h"

Router::Router() {
    setup();
}

// init the node
void Router::setup() {
    title = "Selector";
    desc = "Read input";
    name = "control/router";


    for( const auto& inputObj : props["inputs"].as<JsonArray>() ) {
        addInput(inputObj["name"].as<std::string>());
    }

    for( const auto& inputObj : props["outputs"].as<JsonArray>() ) {
        addOutput(inputObj["name"].as<std::string>());
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