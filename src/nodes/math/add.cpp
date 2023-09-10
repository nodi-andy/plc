#include "add.h"

LogicAdd::LogicAdd() {
}

// init the node
void LogicAdd::setup() {
    title = "LogicAdd";
    desc = "Read input";
    name = "logic/add";

    //Serial.print(" Add inputs:");
    for( const auto& inputObj : props["inputs"].as<JsonArray>() ) {
        Serial.println(inputObj["name"].as<std::string>().c_str());
        addInput(inputObj["name"].as<std::string>());
        inputVals[inputObj["name"].as<std::string>()][0] = 0;
    }

    //Serial.print(" Add outputs:");
    for( const auto& inputObj : props["outputs"].as<JsonArray>() ) {
        Serial.println(inputObj["name"].as<std::string>().c_str());
        addOutput(inputObj["name"].as<std::string>());
    }

    value = 1;
}

int LogicAdd::onExecute() {
    bool update = false;
    value = 0;
    for (auto& input : inputs) {
      if (input.second) {
        update = true;
        inputVals[input.first][0] = input.second;
        Serial.println(*input.second);
      } else if (props["properties"].containsKey(input.first)) {
       // inputVals[input.first] = props["properties"][input.first].as<int>();
      }
      input.second = nullptr;
    }

    for (auto input : inputVals) {
        value += *(input.second[0]);
    }

    if (update) {
        setOutput("v", &value);
        Serial.println("ADD gate output ");
    }
    return 0;
}