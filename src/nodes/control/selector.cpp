#include "selector.h"

Selector::Selector() {
    setup();
}

// init the node
void Selector::setup() {
    title = "Selector";
    desc = "Read input";
    name = "control/selector";


    for( const auto& inputObj : props["inputs"].as<JsonArray>() ) {
        addInput(inputObj["name"].as<std::string>());
    }

    for( const auto& inputObj : props["outputs"].as<JsonArray>() ) {
        addOutput(inputObj["name"].as<std::string>());
    }

}

int Selector::onExecute() {
    bool update = false;
    for (auto& input : inputs) {
      if (input.second) {
        update = true;
        inputVals[input.first] = *(input.second);
      }
      input.second = nullptr;
    }

    int inpSelect = inputVals["SelIn"];
    if (inpSelect && update) {
        std::string inpString;
        inpString.push_back(inpSelect + 96);
        value = props["properties"][inpString];
        setOutput("out", &value);
        Serial.print("Select: ");
        Serial.print(inpString.c_str());
    }
    return 0;
}