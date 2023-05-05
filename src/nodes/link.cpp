#include "link.h"

Link::Link(Node* fromNode, std::string srcPort, Node* toNode, std::string dstPort) {
    from = fromNode;
    to = toNode;
    src = srcPort;
    dst = dstPort;
    /* Serial.print("> Link::Link: ");
    Serial.print(id);
    Serial.print(" From:");
    Serial.print(from->id);
    Serial.print(" Src Port:");
    Serial.print(src.c_str());
    Serial.print(" To:");
    Serial.print(to->id);
    Serial.print(" Port:");
    Serial.print(dst.c_str()); */
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
    if (v == nullptr) return 0;
    Serial.println("");
    Serial.print("> Run link:");
    Serial.print(id);
    Serial.print(" From: ");
    Serial.print(from->id);
    Serial.print("/");
    Serial.print(from->title.c_str());
    Serial.print(" Port:'");
    Serial.print(src.c_str());
    Serial.print("' To:");
    Serial.print(to->id);
    Serial.print("/");
    Serial.print(to->title.c_str());
    Serial.print(" Port: '");
    Serial.print(dst.c_str());
    Serial.print("' Value: ");
    Serial.println(*v);

    to->setInput(dst, v);
    return 0;
}