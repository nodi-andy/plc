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
    //int* v = from->getOutput(src);
    int v = from->getProp(src, "outValue");
    int inpValue = to->getProp(dst, "inpValue");
    if (v != INT_MAX && inpValue == INT_MAX) {
        Serial.println("");
        Serial.printf("> Run linkID: %d From: %d  To: %d Port:'%d' To: %d Port: '%d' Value: %d\n", id, from->id, from->title.c_str(), src.c_str(), to->id, to->title.c_str(), dst.c_str(), v);

        //if (to->getInput(dst) == nullptr) to->setInput(dst, v);
        to->setProp(dst, "inpValue", v);
    }

    return 0;
}