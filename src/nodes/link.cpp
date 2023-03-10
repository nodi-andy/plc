#include "link.h"

Link::Link(Node* from, int src, Node* to, int dst) {
    this->from = from;
    this->to = to;
    this->src = src;
    this->dst = dst;
    this->setup();
}

// init the node
void Link::setup() {
    this->title = "Link";
    this->desc = "Connect nodes";
    addInput("src");
    addOutput("dst");
}

void Link::onExecute() {
    if (this->from == NULL) return;
    if (this->to == NULL) return;
    this->value = this->from->getOutput(this->src);
    this->to->setInput(this->dst, this->value);
}