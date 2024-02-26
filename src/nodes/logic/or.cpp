#include "or.h"

LogicOr::LogicOr() {
    setup();
}

// init the node
void LogicOr::setup() {
    title = "LogicOr";
    desc = "Read input";
    name = "logic/or";
}

vector<string> LogicOr::run() {
    vector<string> ret;
    bool update = false;
    output = 0;
    int inpA = getInput("a");
    int inpB = getInput("b");
    if (inpA != INT_MAX) {
        A = inpA;
        //setInput("a", INT_MAX);
        Serial.print("A gate:");
        Serial.println(A);
        update = true;
    }
    if (inpB != INT_MAX) {
        B = inpB;
        //setInput("b", INT_MAX);
        output = value;
        Serial.print("B gate:");
        Serial.println(B);
        update = true;
    }
 
    if (update) {
        value = A || B;
        output = value;
        setOutput("v", output);
        Serial.println("AND gate output ");
    }
    return ret;
}