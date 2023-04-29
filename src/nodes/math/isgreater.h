#include <Arduino.h>

#include "../../map/node.h"

// Inc/dec/reset an integer
class IsGreater : public Node
{
    public:
    IsGreater();
    int A = 0;
    int B = 0;
    virtual IsGreater* createInstance() const override {
        return new IsGreater(*this); // Create a new instance of the Link object
    }
    virtual std::string getType() const override {
        return "math/isgreater";
    }

    void setup();
    int onExecute();

    private:
    int value;
    int *output;
};

static bool IsGreaterRegistered = []() {
    RegistryManager::getInstance().registerNode(new IsGreater());
    return true;
}();