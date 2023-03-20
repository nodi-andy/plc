#include <Arduino.h>

#include "../../map/node.h"

// Inc/dec/reset an integer
class Selector : public Node
{
    public:
    Selector();
    virtual Selector* createInstance() const override {
        return new Selector(*this); // Create a new instance of the Link object
    }
    virtual std::string getType() const override {
        return "routing/selector";
    }

    void setup();
    void onExecute();

};

static bool selectorRegistered = []() {
    RegistryManager::getInstance().registerNode(new Selector());
    return true;
}();

