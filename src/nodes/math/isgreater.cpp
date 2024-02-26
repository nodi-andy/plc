#include "isgreater.h"

IsGreater::IsGreater() {
}

// init the node
void IsGreater::setup() {
    title = "is less";
    desc = "Is less";
    name = "math/isgreater";
}

vector<string> IsGreater::run() {
    vector<string> ret;
    bool update = false;
    output = NULL;
    if (getInput("in1") != INT_MAX) {
        A = getInput("in1");
        Serial.print("A gate:");
        Serial.println(A);
        update = true;
        //setInput("in1", INT_MAX);
    }

    if (getInput("in2") != INT_MAX) {
        B = getInput("in2");
        Serial.print("B gate:");
        Serial.println(B);
        update = true;
        //setInput("in1", INT_MAX);
    }
 
    if (update) {
        //vals["value"][1] = (A > B);
        //setOutput("v", vals["value"][1]);
        Serial.println("IsEqual output ");
    }
    return ret;
}