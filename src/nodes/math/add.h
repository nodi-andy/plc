#include <Arduino.h>

#include "../../nodework/node.h"

// Inc/dec/reset an integer
class LogicAdd : public Node
{
    public:
    LogicAdd();
    int A = 0;
    int B = 0;
    virtual LogicAdd* createInstance() const override {
        return new LogicAdd(*this); // Create a new instance of the Link object
    }
    virtual std::string getType() const override {
        return "math/add";
    }

    void setup();
    vector<string> run();

    private:
    int value;
    int *output;
};

static bool LogicAddRegistered = []() {
    RegistryManager::getInstance().registerNode(new LogicAdd());
    return true;
}();

