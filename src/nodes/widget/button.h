#include <Arduino.h>
#include "../../map/node.h"

// Button digital input
class Button : public Node
{
    public:
    ~Button(){};
    Button(int portNr = -1);
    virtual std::string getType() const override {
        return "widget/button";
    }
    virtual Button* createInstance() const override {
        return new Button(*this); // Create a new instance of the Button object
    }
    void setup();
    int onExecute();

    private:
    int defaultDownVal;
    int defaultPressedVal;
    int defaultUpVal;
    int defaultReleasedVal;
    int *defaultDown;
    int *defaultPressed;
    int *defaultUp;
    int *defaultReleased;
    int *input;
    int *output;
};

static bool buttonRegistered = []() {
    RegistryManager::getInstance().registerNode(new Button());
    return true;
}();
