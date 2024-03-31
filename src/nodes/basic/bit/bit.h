#include <Arduino.h>
#include "../../../nodework/node.h"

class Bit : public Node
{
    public:
    Bit();
    bool isNotConnected = false;
    virtual std::string getType() const override {
        return "basic/bit";
    }
    virtual Bit* createInstance() const override {
        return new Bit(*this); // Create a new instance of the Toggle object
    }
    vector<string> run();
};

static bool toogleRegistered = []() {
    RegistryManager::getInstance().registerNode(new Bit());
    return true;
}();
