#include <Arduino.h>

#include "../../map/node.h"

// Inc/dec/reset an integer
class LogicAnd : public Node
{
    public:
    LogicAnd();
    virtual LogicAnd* createInstance() const override {
        return new LogicAnd(*this); // Create a new instance of the Link object
    }
    virtual std::string getType() const override {
        return "logic/AND";
    }

    void setup();
    void onExecute();

    private:
    int lastIncInput;
    int lastResetInput;
};

static bool LogicAndRegistered = []() {
    RegistryManager::getInstance().registerNode(new LogicAnd());
    return true;
}();

