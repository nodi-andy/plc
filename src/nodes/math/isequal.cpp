#include "isequal.h"

IsEqual::IsEqual() {
}

// init the node
void IsEqual::setup() {
    title = "IsEqual";
    desc = "Is Equal";
    name = "math/isequal";

    addInput("a");
    addInput("b");
    addOutput("v");

    A = props["properties"]["a"].as<int>();
    B = props["properties"]["b"].as<int>();
    value = 1;
    state = 0;
}

int IsEqual::onExecute() {
    bool update = false;
    if (getInput("a")) {
        A = *getInput("a");
        setInput("a", NULL);
        Serial.print("A gate:");
        Serial.println(A);
        update = true;
    }
    if (getInput("b")) {
        B = *getInput("b");
        setInput("b", NULL);
        Serial.print("B gate:");
        Serial.println(B);
        update = true;
    }
 
    if (update) {
        value = (A == B);
        setOutput("v", &value);
        Serial.print("IsEqual output ");
        Serial.println(value);
    }
    return 0;
}