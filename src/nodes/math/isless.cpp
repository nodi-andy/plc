#include "isless.h"

IsLess::IsLess() {
}

// init the node
void IsLess::setup() {
    title = "is less";
    name = "math/isless";

    value = 1;
}

vector<string> IsLess::run() {
    vector<string> ret;
    bool update = false;
    output = 0;
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
        output = value;
        Serial.print("B gate:");
        Serial.println(B);
        update = true;
    }
 
    if (update) {
        value = (A < B);
        output = value;
        setOutput("v", output);
        Serial.println("IsEqual output ");
    }
    return ret;
}