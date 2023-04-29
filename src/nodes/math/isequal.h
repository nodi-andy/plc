#include <Arduino.h>

#include "../../map/node.h"

// Inc/dec/reset an integer
class IsEqual : public Node
{
    public:
    IsEqual();
    int A = 0;
    int B = 0;
    virtual IsEqual* createInstance() const override {
        return new IsEqual(*this); // Create a new instance of the Link object
    }
    virtual std::string getType() const override {
        return "math/isequal";
    }

    void setup();
    int onExecute();

    private:
    int value;
    int *output;
};

static bool IsEqualRegistered = []() {
    RegistryManager::getInstance().registerNode(new IsEqual());
    return true;
}();