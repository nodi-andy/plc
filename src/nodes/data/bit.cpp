#include "bit.h"

Bit::Bit() {
}

// init the node
void Bit::setup() {
    title = "Bit";
    name = "Toggle";
}

vector<string> Bit::run() {
    vector<string> ret;
    int inputSet = getInput("set");
    if (inputSet != INT_MAX) {
        newvalue = 1;
        //setInput("set", INT_MAX);
    }

    int inputClear = getInput("clear");
    if (inputClear != INT_MAX) {
        newvalue = 0;
        //setInput("clear", INT_MAX);
    }

    int inputToggle = getInput("toggle");
    if (inputToggle != INT_MAX) {
        newvalue = !value;
        //setInput("toggle", INT_MAX);
    }
    
    if (port) {
      digitalWrite(port, value ? HIGH : LOW);
    }
    //ret = (value != newvalue);
    value = newvalue;
    /*if (ret) {
        setOutput("v", value);
    }*/
    return ret;
}