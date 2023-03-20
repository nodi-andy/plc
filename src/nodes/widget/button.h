#include <Arduino.h>
#include "../../map/node.h"

enum ButtonIO { VALUE }; 
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
    void onExecute();

    private:
    int defaultOutput = 1;
    int* input;
    int* output;
};

static bool buttonRegistered = []() {
    RegistryManager::getInstance().registerNode(new Button());
    return true;
}();
