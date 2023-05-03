#include "junction.h"

Junction::Junction() {
}

// init the node
void Junction::setup() {
    title = "Junction";
    name = "Toggle";
    desc = "Show value of input";
    multipleInput = true;

    for( const auto& inputObj : props["inputs"].as<JsonArray>() ) {
        Serial.println(inputObj["name"].as<std::string>().c_str());
        addInput(inputObj["name"].as<std::string>());
    }

    for( const auto& inputObj : props["outputs"].as<JsonArray>() ) {
        Serial.println(inputObj["name"].as<std::string>().c_str());
        addOutput(inputObj["name"].as<std::string>());
    }
}

int Junction::onExecute() {
    for (auto& input : inputs) {
      if (input.second) {
        setOutput("out", input.second);
        break;
        Serial.println(*input.second);
      }
    }

    inputs.clear();
    return 0;
}