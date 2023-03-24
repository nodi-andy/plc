#include <Arduino.h>

#include "../../map/node.h"

class Comparator : public Node
{
    public:
    Comparator();
    virtual Comparator* createInstance() const override {
        return new Comparator(*this); // Create a new instance of the Link object
    }
    virtual std::string getType() const override {
        return "logic/comparator";
    }

    void setup();
    int onExecute();

};

static bool counterRegistered = []() {
    RegistryManager::getInstance().registerNode(new Comparator());
    return true;
}();

