#include "link.h"

Link::Link(Node* fromNode, int srcPort, Node* toNode, int dstPort) {
    from = fromNode;
    to = toNode;
    src = srcPort;
    dst = dstPort;
    Serial.print("> Link::Link: ");
    Serial.print(id);
    Serial.print(" From:");
    Serial.print(from->id);
    Serial.print(" Src Port:");
    Serial.print(src);
    Serial.print(" To:");
    Serial.print(to->id);
    Serial.print(" Port:");
    Serial.print(dst);
}

// init the node
void Link::setup() {
    title = "Link";
    desc = "Connect nodes";
}

int Link::onExecute() {
    if (from == NULL) return 0;
    if (to == NULL) return 0;
    int* v = from->getOutput(src);
    /*Serial.println("");
    Serial.print("> Run link: ");
    Serial.print(id);
    Serial.print(" From:");
    Serial.print(from->id);
    Serial.print(" Src Port:");
    Serial.print(src);
    Serial.print(" To:");
    Serial.print(to->id);
    Serial.print(" Port:");
    Serial.print(dst);
    if (v) {
      Serial.println("Value:");
      Serial.print(*v);
    }*/
    if (to->multipleInput) {
        to->addInput(v);
    } else {
        to->setInput(dst, v);
    }
    return 0;
}