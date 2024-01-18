#include <Arduino.h>
#include "../../../map/node.h"


//Toggle a bit
class Number : public Node
{
    public:
    Number();
    virtual std::string getType() const override {
        return "data/number";
    }
    virtual Number* createInstance() const override {
        return new Number(*this); // Create a new instance of the Toggle object
    }
    void setup();
    int onExecute();

    bool isConst = false;
};

static bool NumberRegistered = []() {
    RegistryManager::getInstance().registerNode(new Number());
    return true;
}();
