#include "link.h"

Link::Link(Node* from, int src, Node* to, int dst) {
    from = from;
    to = to;
    src = src;
    dst = dst;
    setup();
}

// init the node
void Link::setup() {
    title = "Link";
    desc = "Connect nodes";
    addInput("src");
    addOutput("dst");
}

void Link::onExecute() {
    if (this->from == NULL) return;
    if (this->to == NULL) return;
    int* v = from->getOutput(src);
    to->setInput(this->dst, v);
}