#include <Arduino.h>

#include "../../map/node.h"

// Inc/dec/reset an integer
class MathMult : public Node
{
    public:
    MathMult();

    virtual MathMult* createInstance() const override {
        return new MathMult(*this); // Create a new instance of the Link object
    }
    virtual std::string getType() const override {
        return "math/mult";
    }

    void setup();
    int onExecute();

    private:
    std::unordered_map<std::string, int> inputVals;
    int value;
    int *output;
};

static bool MathMultRegistered = []() {
    RegistryManager::getInstance().registerNode(new MathMult());
    return true;
}();

