#include <Arduino.h>

#include "../../map/node.h"

// Inc/dec/reset an integer
class LogicOr : public Node
{
    public:
    LogicOr();
    virtual LogicOr* createInstance() const override {
        return new LogicOr(*this); // Create a new instance of the Link object
    }
    virtual std::string getType() const override {
        return "logic/OR";
    }

    void setup();
    int onExecute();

    private:
    int lastIncInput;
    int lastResetInput;
};

static bool counterRegistered = []() {
    RegistryManager::getInstance().registerNode(new LogicOr());
    return true;
}();

