#include "node.h"

using namespace std;

void Node::setupVals() {
        // Iterate through the properties object
    for (JsonPair property : props["properties"].as<JsonObject>()) {
      JsonObject propObj = property.value().as<JsonObject>();
      const char* propertyName = property.key().c_str();
      
      // Call your addInput function with propertyName
      Serial.print("Adding property: ");
      Serial.println(propertyName);
      addProp(propertyName);
      vals[propertyName][1] = props["properties"][propertyName]["value"].as<int>();
    }
}

void Node::addInput(string name) {

}
void Node::addOutput(string name) {
    
}
void Node::addProp(string name) {
    vals.insert({name, {INT_MAX, INT_MAX, INT_MAX}});
}

int Node::hasInput(string name) {
    return getInput(name) != INT_MAX;
};

int Node::getInput(string name) {
    return getProp(name, "inpValue");
};

void Node::clearInput(string name) {
    setProp(name, "inpValue", INT_MAX);
};

void Node::setInput(string name, int val) {
    setProp(name, "inpValue", val);
    //inputVals[name][0] = val;
    //inputs[name] = val;
};

void Node::setOutput(string name, int val) {
    setProp(name, "outValue", val);

};
int Node::getOutput(string name) {
    return getProp(name, "outValue");
};

void Node::setProp(string key, string name, int val) {
    props[key][name] = val;
    if (val != INT_MAX) Serial.printf("setProp: %s.%s = %d\n" , key.c_str(), name.c_str(), props[key][name].as<int>());
};

int Node::getProp(string key, string name) {
    //Serial.printf("getProp: size = %d\n", props.size() );
    int prop = INT_MAX;
    if (props[key].containsKey(name)) prop = props[key][name].as<int>();
    return prop;
};

void Node::setProps(JsonObject newProps) {
    jsonString.clear();
    serializeJson(newProps, jsonString);
    //Serial.printf("setProp: string = %s\n", jsonString.c_str() );

    deserializeJson(jsondoc, jsonString);
    props = jsondoc.as<JsonObject>();
    //Serial.printf("setProps: size = %d, %s\n", props.size(), props["port"]["value"].as<string>().c_str() );
}

JsonObject Node::getProps() {
    //Serial.print("getProps: size = " );
    //Serial.println(props.size());
    return props;
}

void Node::setup()
{

}

int Node::onExecute()
{
    return 0;
}
