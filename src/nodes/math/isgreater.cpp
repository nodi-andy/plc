#include "isgreater.h"

IsGreater::IsGreater() {
}

// init the node
void IsGreater::setup() {
    title = "is less";
    desc = "Is less";
    name = "math/isgreater";
    setupVals();
}

int IsGreater::onExecute() {
    bool update = false;
    output = NULL;
    if (getInput("in1") != nullptr && *(getInput("in1")) != INT_MAX) {
        A = *getInput("in1");
        Serial.print("A gate:");
        Serial.println(A);
        update = true;
        setInput("in1", NULL);
    }

    if (getInput("in2") != nullptr && *(getInput("in2")) != INT_MAX) {
        B = *getInput("in2");
        Serial.print("B gate:");
        Serial.println(B);
        update = true;
        setInput("in1", NULL);
    }
 
    if (update) {
        vals["value"] = (A > B);
        setOutput("v", &vals["value"]);
        Serial.println("IsEqual output ");
    }
    return 0;
}