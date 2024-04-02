#include "inserter.h"
#include "../../../nodework/enums.h"

Inserter::Inserter()
{
}

// init the node
void Inserter::setup()
{
}

vector<string> Inserter::run()
{
    vector<string> ret;
    if (hasStrInput("from")) {
        setValue("from", getStrInput("from"));
        clearInput("from");
        ret.push_back("from");
    }
    if (hasStrInput("to")) {
        setValue("to", getStrInput("to"));
        Serial.printf("[inserter::hasStrInput] id: %s\n", getStrInput("to"));
        clearInput("to");
        ret.push_back("to");
    }
    if (source && source->hasOutput(getStrValue("from"))) {
        Serial.printf("[inserter::pickValue] id: %d\n", source->getOutput("value"));
        setValue("value", source->getOutput(getStrValue("from")));
        source->clearOutput("value");
    }
    if (target && vals.count("value")) {
        Serial.printf("[inserter::placeValue] to: %s, value: %d\n", getStrValue("to").c_str(), source->getOutput("value"));
        target->setInput(getStrValue("to"), id, getValue("value"));
        vals.erase("value");
    }
    return ret;
}

void Inserter::reconnect(int x, int y)
{
    Serial.printf("[inserter::reconnect]\n");
    if (!parent)
        return;

    const auto &dirVec = NodiEnums::dirToVec[dir];
    Node *nextSource = parent->getNodeOnGrid(x - dirVec.x, y - dirVec.y);
    Node *nextTarget = parent->getNodeOnGrid(x + dirVec.x, y + dirVec.y);
    if (nextSource != nullptr) Serial.printf("[inserter::source_exists] \n");
    if (nextTarget != nullptr) Serial.printf("[inserter::target_exists] \n");

    Serial.printf("[inserter::disconnect] id: %d\n", id);

    // Disconnect
    if (target != nextTarget)
    {
        if (target)
            target->clearInputsByNodeID(id);
    }
    if (source != nextSource)
    {
        setValue("from", "");
    }

    if (nextSource == nullptr && source)
    {
        clearInput();
    }

    Serial.printf("[inserter::connect] id: %d\n", id);

    // Connect
    if (nextSource != nullptr && (source == nullptr || source != nextSource))
    {
        Serial.printf("[inserter::reconnect:from] id: %d\n", nextSource->id);
        setValue("from", nextSource->defaultOutput);
    }
    source = nextSource;

    if (source == nullptr)
        vals.erase("value");
    else
    {
        Serial.printf("[inserter::source] id: %d\n", source->id);
        setValue("value", source->getOutput(getStrValue("from")));
    }

    if (nextTarget != nullptr && (target == nullptr || target != nextTarget))
    {
        if (hasValue("to")) {
            if (target != nullptr) target->setInput(getStrValue("to"), id, 0); //{val: undefined, update: 1}
        } else {
            setValue("to", nextTarget->defaultInput);
        }
    }
    target = nextTarget;
    // if (target != nullptr) Serial.printf("[inserter::reconnect:to] id: %d\n", target->id);
    // if (target != nullptr && source != nullptr) Serial.printf("[inserter::connection:done]\n");

}