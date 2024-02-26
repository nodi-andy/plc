#include <Arduino.h>
#include "../../../nodework/node.h"


//Toggle a bit
class Toggle : public Node
{
    public:
    Toggle();
    bool isNotConnected = false;
    virtual std::string getType() const override {
        return "basic/toggle";
    }
    virtual Toggle* createInstance() const override {
        return new Toggle(*this); // Create a new instance of the Toggle object
    }
    void setup();
    vector<string> run();
};

static bool toogleRegistered = []() {
    RegistryManager::getInstance().registerNode(new Toggle());
    return true;
}();
