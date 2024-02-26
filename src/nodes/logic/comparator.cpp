#include "comparator.h"

Comparator::Comparator() {
}

// init the node
void Comparator::setup() {
    title = "IsEq";
    desc = "Read input";
    name = "logic/and";
}

vector<string> Comparator::run() {
    vector<string> ret;
    value = (getInput("A") == getInput("B"));
    this->setOutput(0, value);
    return ret;
}