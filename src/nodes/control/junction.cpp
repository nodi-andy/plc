#include "junction.h"

Junction::Junction() {
  setup();
}

// init the node
void Junction::setup() {
    title = "Junction";
    name = "Junction";
    multipleInput = true;

    for( const auto& inputObj : props["inputs"].as<JsonArray>() ) {
        Serial.print("Junction input:");
        Serial.println(inputObj["name"].as<std::string>().c_str());
        addInput(inputObj["name"].as<std::string>());
    }

    for( const auto& inputObj : props["outputs"].as<JsonArray>() ) {
        Serial.println(inputObj["name"].as<std::string>().c_str());
        addOutput(inputObj["name"].as<std::string>());
    }
    Serial.print("Junction SETUP: ");
    Serial.print(inputs.size());
}   
int Junction::onExecute() {
    bool update = false;
    for (auto& input : inputs) {
      if (input.second) {
        Serial.print("Junction: ");
        Serial.println(*input.second);
        props["properties"][input.first] = *(input.second);
        update = true;
      }
      input.second = nullptr;
    }
    
    if (update) {
      value = props["properties"]["in"].as<int>();
      setOutput("out", &value);
    }

    return 0;
}