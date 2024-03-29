#include <Arduino.h>
#include "../../../nodework/node.h"


//Toggle a bit
class LED : public Node
{
    public:
    LED();
    bool isNotConnected = false;
    virtual std::string getType() const override {
        return "basic/led";
    }
    virtual LED* createInstance() const override {
        return new LED(*this); // Create a new instance of the Toggle object
    }

    
    void setup();
    vector<string> run();
};

static bool toogleRegistered = []() {
    RegistryManager::getInstance().registerNode(new LED());
    return true;
}();
