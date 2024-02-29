#include <Arduino.h>
#include "../../../nodework/node.h"

// Button digital input
class Button : public Node
{
    public:
    ~Button(){};
    Button();
    virtual std::string getType() const override {
        return "basic/button";
    }
    virtual Button* createInstance() const override {
        return new Button(*this); // Create a new instance of the Button object
    }
    void setup();
    vector<string> run();

    private:
    int port;
    int state;
};

static bool buttonRegistered = []() {
    RegistryManager::getInstance().registerNode(new Button());
    return true;
}();
