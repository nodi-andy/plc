#include <Arduino.h>
#include "../../../nodework/node.h"

class Number : public Node
{
    public:
    Number();
    virtual std::string getType() const override {
        return "basic/number";
    }
    virtual Number* createInstance() const override {
        return new Number(*this); // Create a new instance of the Toggle object
    }
    void setup();
    vector<string> run();
};

static bool NumberRegistered = []() {
    RegistryManager::getInstance().registerNode(new Number());
    return true;
}();
