#include "mult.h"

MathMult::MathMult() {
}

// init the node
void MathMult::setup() {
    title = "MathMult";
    name = "math/mult";

    //Serial.print(" Add inputs:");
   /* for( const auto& inputObj : props["inputs"].as<JsonArray>() ) {
        Serial.println(inputObj["name"].as<std::string>().c_str());
        addInput(inputObj["name"].as<std::string>());
        inputVals[inputObj["name"].as<std::string>()][0] = 0;
    }

    //Serial.print(" Add outputs:");
    for( const auto& inputObj : props["outputs"].as<JsonArray>() ) {
        Serial.println(inputObj["name"].as<std::string>().c_str());
        addOutput(inputObj["name"].as<std::string>());
    }*/

    value = 1;
}

vector<string> MathMult::run() {
    vector<string> ret;
    bool update = false;
    /*for (auto& input : inputs) {
      if (input.second) {
        update = true;
        inputVals[input.first][0] = input.second;
      }/* else if (props["properties"].containsKey(input.first)) {
        //inputVals[input.first] = props["properties"][input.first].as<int>();
      }
      //input.second = nullptr;
    }
 
    value = 1;
    for (auto input : inputVals) {
        value *= *(input.second[0]);
    }
*/
    if (update) {
        setOutput("v", value);
        Serial.print("Mult output: ");
        Serial.println(value);
    }
    return ret;
}