#include <Arduino.h>

#include "../../map/node.h"

// Inc/dec/reset an integer
class LogicAnd : public Node
{
    public:
    LogicAnd();
    int A = 0;
    int B = 0;
    virtual LogicAnd* createInstance() const override {
        return new LogicAnd(*this); // Create a new instance of the Link object
    }
    virtual std::string getType() const override {
        return "logic/and";
    }

    void setup();
    int onExecute();

    private:
    int value;
    int *output;
};

static bool LogicAndRegistered = []() {
    RegistryManager::getInstance().registerNode(new LogicAnd());
    return true;
}();

