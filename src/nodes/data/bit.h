#include <Arduino.h>
#include "../../nodework/node.h"


//Toggle a bit
class Bit : public Node
{
    public:
    Bit();
    virtual std::string getType() const override {
        return "data/bit";
    }
    virtual Bit* createInstance() const override {
        return new Bit(*this); // Create a new instance of the Toggle object
    }
    void setup();
    vector<string> run();
};

static bool bitRegistered = []() {
    RegistryManager::getInstance().registerNode(new Bit());
    return true;
}();
