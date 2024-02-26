#include <Arduino.h>

#include "../../nodework/node.h"

// Inc/dec/reset an integer
class LogicNot : public Node
{
    public:
    LogicNot();
    virtual LogicNot* createInstance() const override {
        return new LogicNot(*this); // Create a new instance of the Link object
    }
    virtual std::string getType() const override {
        return "logic/not";
    }

    void setup();
    vector<string> run();
    int output;
};

static bool counterRegistered = []() {
    RegistryManager::getInstance().registerNode(new LogicNot());
    return true;
}();

