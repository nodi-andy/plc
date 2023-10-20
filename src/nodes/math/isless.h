#include <Arduino.h>

#include "../../map/node.h"

// Inc/dec/reset an integer
class IsLess : public Node
{
    public:
    IsLess();
    int A = 0;
    int B = 0;
    virtual IsLess* createInstance() const override {
        return new IsLess(*this); // Create a new instance of the Link object
    }
    virtual std::string getType() const override {
        return "math/isless";
    }

    void setup();
    int onExecute();

    private:
    int value;
    int output;
};

static bool IsLessRegistered = []() {
    RegistryManager::getInstance().registerNode(new IsLess());
    return true;
}();

