#include "isequal.h"

IsEqual::IsEqual() {
}

// init the node
void IsEqual::setup() {
    title = "IsEqual";
    desc = "Is Equal";
    name = "math/isequal";

    A = getValue("a");
    B = getValue("b");
    value = 1;
    state = 0;
}

vector<string> IsEqual::run() {
    vector<string> ret;
    bool update = false;
    if (getInput("a")) {
        A = getInput("a");
        //setInput("a", INT_MAX);
        Serial.print("A gate:");
        Serial.println(A);
        update = true;
    }
    if (getInput("b")) {
        B = getInput("b");
        //setInput("b", INT_MAX);
        Serial.print("B gate:");
        Serial.println(B);
        update = true;
    }
 
    if (update) {
        value = (A == B);
        setOutput("v", value);
        Serial.print("IsEqual output ");
        Serial.println(value);
    }
    return ret;
}