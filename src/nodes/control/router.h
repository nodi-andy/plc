#include <Arduino.h>

#include "../../nodework/node.h"

// Inc/dec/reset an integer
class Router : public Node
{
    public:
    Router();
    virtual Router* createInstance() const override {
        return new Router(*this); // Create a new instance of the Link object
    }
    virtual std::string getType() const override {
        return "control/filter";
    }

    void setup();
    vector<string> run();
};

static bool routerRegistered = []() {
    RegistryManager::getInstance().registerNode(new Router());
    return true;
}();

