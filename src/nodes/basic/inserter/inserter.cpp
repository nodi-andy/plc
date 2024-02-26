#include "inserter.h"

Inserter::Inserter() {
}

// init the node
void Inserter::setup() {
    title = "Number";
    name = "Toggle";
    desc = "Show value of input";
    newvalue = value;
}

vector<string> Inserter::run() {
    vector<string> ret;
    
    if (source && source->hasOutput(sourcePortName)) {
        setValue("value", source->getOutput(sourcePortName));
        source->clearOutput(sourcePortName);
    }
    if (target) {
        target->setInput(targetPortName, id, getValue("value"));
    }
    return ret;
}

void Inserter::reconnect() {
   /* Map *nodework = this->parent;
    const auto &dirVec = NodiEnums::dirToVec[this->dir];
    Node *nextSource = nodework->getNodeOnGrid(pos[0] - dirVec.x, pos[1] - dirVec.y);
    Node *nextTarget = nodework->getNodeOnGrid(pos[0] + dirVec.x, pos[1] + dirVec.y);

    // Disconnect
    if (this->target != nextTarget) {
        if (this->target) this->target->clearInputsByNodeID(this->id);
    }
    if (this->source != nextSource) {
        this->sourcePortName = "";
    }

    if (nextSource == NULL && this->source) {
        this->clearInput();
    }

    // Connect
    if (nextSource != NULL && (this->source == NULL  || this->source != nextSource)) {
        props.from.value = NodeWork.getNodeType(nextFromNode.type).defaultOutput;
    }
    this->source = nextSource;
    if (this->source == NULL) {
        props.value.value = undefined;
    } else {
        props.value.value = this->source.properties[props.from.value].value;
    }
    
    if (nextTarget != NULL && (this->toNode == NULL || this->toNode != nextTarget)) {
        if (props.to.value == null) 
            props.to.value = NodeWork.getNodeType(nextTarget->type).defaultInput;
        else 
            nextTarget->properties[props.to.value].inpValue[this->nodeID] = {val: undefined, update: true};
    }
    this->toNode = nextTarget;*/
}