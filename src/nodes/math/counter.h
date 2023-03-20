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
        return "events/counter";
    }

    void setup();
    void onExecute();

    private:
    int lastIncInput;
    int lastResetInput;
};

static bool counterRegistered = []() {
    RegistryManager::getInstance().registerNode(new Counter());
    return true;
}();

