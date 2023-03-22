#include <Arduino.h>
#include "../../map/node.h"


//Toggle a bit
class Junction : public Node
{
    public:
    Junction();
    virtual std::string getType() const override {
        return "basic/junction";
    }
    virtual Junction* createInstance() const override {
        return new Junction(*this); // Create a new instance of the Toggle object
    }
    void setup();
    void onExecute();
};

static bool bitRegistered = []() {
    RegistryManager::getInstance().registerNode(new Junction());
    return true;
}();