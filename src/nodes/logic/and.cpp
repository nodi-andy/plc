#include "and.h"

LogicAnd::LogicAnd()
{
}

// init the node
void LogicAnd::setup()
{
  title = "LogicAnd";
  name = "logic/and";

  // Serial.print(" And inputs:");
  /*for( const auto& inputObj : props["inputs"].as<JsonArray>() ) {
      Serial.println(inputObj["name"].as<std::string>().c_str());
      addInput(inputObj["name"].as<std::string>());
      inputVals[inputObj["name"].as<std::string>()][0] = 0;
  }

  //Serial.print(" And outputs:");
  for( const auto& inputObj : props["outputs"].as<JsonArray>() ) {
      Serial.println(inputObj["name"].as<std::string>().c_str());
      addOutput(inputObj["name"].as<std::string>());
  }*/

  value = 1;
}

vector<string> LogicAnd::run()
{
  vector<string>ret;
  bool update = false;
  value = 1;
  /*for (auto& input : inputs) {
    if (input.second) {
      update = true;
      inputVals[input.first][0] = input.second;
      Serial.println(*input.second);
    }
    input.second = nullptr;
  }


  for (auto input : inputVals) {
    if (input.second[0] == 0) {
      value = 0;
      break;
    }
  }*/

  if (update)
  {
    setOutput("v", value);
    Serial.println("AND gate output ");
  }
  return ret;
}