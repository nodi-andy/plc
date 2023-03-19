#include <Arduino.h>

#include "../../map/node.h"

// Inc/dec/reset an integer
class Stepper : public Node
{
    public:
    Stepper();
    ~Stepper();
    virtual Stepper* createInstance() const override {
        return new Stepper(*this); // Create a new instance of the Link object
    }
    virtual std::string getType() const override {
        return "widget/stepper";
    }

    void setup();
    void onExecute();

    private:
    int targetSpeed;
    int speed;
    int dir;
    int targetPos;
    int pos;
    hw_timer_t *My_timer;

};

static bool stepperRegistered = []() {
    RegistryManager::getInstance().registerNode(new Stepper());
    return true;
}();