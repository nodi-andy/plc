#include "comparator.h"

Comparator::Comparator() {
}

// init the node
void Comparator::setup() {
    title = "IsEq";
    name = "logic/and";
}

vector<string> Comparator::run() {
    vector<string> ret;
    setValue("value", (getInput("A") == getInput("B")));
    this->setOutput(0, getInput("value"));
    return ret;
}