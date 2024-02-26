#include <Arduino.h>

#include "../../nodework/node.h"

// Inc/dec/reset an nteger
class Operation : public Node
{
    public:
    Operation();
    virtual std::string getType() const override {
        return "math/operation";
    }
    virtual Operation* createInstance() const override {
        return new Operation(*this); // Create a new instance of the MathOp object
    }
    void setup();
    vector<string> run();

    private:
    std::string myVariant;
    int defaultA;
    int defaultB;
};

static bool MathOpRegistered = []() {
    RegistryManager::getInstance().registerNode(new Operation());
    return true;
}();
