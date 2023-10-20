#include <Arduino.h>

#include "../../map/node.h"

// Inc/dec/reset an integer
class LogicOr : public Node
{
    public:
    LogicOr();    
    int A = 0;
    int B = 0;
    virtual LogicOr* createInstance() const override {
        return new LogicOr(*this); // Create a new instance of the Link object
    }
    virtual std::string getType() const override {
        return "logic/or";
    }

    void setup();
    int onExecute();

    private:
    int value;
    int output;
};

static bool counterRegistered = []() {
    RegistryManager::getInstance().registerNode(new LogicOr());
    return true;
}();

