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
        return "basic/const";
    }

    void setup();
    void onExecute();

    private:
    int value;
};

static bool counterRegistered = []() {
    RegistryManager::getInstance().registerNode(new BasicConst());
    return true;
}();
