#include <Arduino.h>

#include "../../map/node.h"

// Inc/dec/reset an integer
class Counter : public Node
{
    public:
    Counter();
    virtual Counter* createInstance() const override {
        return new Counter(*this); // Create a new instance of the Link object
    }
    virtual std::string getType() const override {
        return "math/counter";
    }

    void setup();
    int onExecute();

    private:
    int lastIncInput;
    int lastDecInput;
    int lastResetInput;
};

static bool counterRegistered = []() {
    RegistryManager::getInstance().registerNode(new Counter());
    return true;
}();

