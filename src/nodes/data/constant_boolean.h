#include <Arduino.h>

#include "../../map/node.h"

//Toggle a bit
class BasicBoolean : public Node
{
    public:
    BasicBoolean();
    virtual BasicBoolean* createInstance() const override {
        return new BasicBoolean(*this); // Create a new instance of the Link object
    }
    virtual std::string getType() const override {
        return "data/boolean";
    }

    void setup();
    void onExecute();

    private:
    int value;
};

static bool counterRegistered = []() {
    RegistryManager::getInstance().registerNode(new BasicBoolean());
    return true;
}();
