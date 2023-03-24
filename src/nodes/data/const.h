#include <Arduino.h>

#include "../../map/node.h"

//Toggle a bit
class BasicConst : public Node
{
    public:
    BasicConst();
    virtual BasicConst* createInstance() const override {
        return new BasicConst(*this); // Create a new instance of the Link object
    }
    virtual std::string getType() const override {
        return "data/variable";
    }

    void setup();
    int onExecute();

    private:
    int value;
    int* output;
};

static bool counterRegistered = []() {
    RegistryManager::getInstance().registerNode(new BasicConst());
    return true;
}();
