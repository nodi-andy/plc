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
    static bool moveForced;
    static int dir;
    static int targetPos;
    static int pos;
    hw_timer_t *My_timer;
    static void IRAM_ATTR onTimer();

};

int Stepper::targetPos = 0;
int Stepper::dir = 0;
int Stepper::pos = 0;
bool Stepper::moveForced = false;

static bool stepperRegistered = []() {
    RegistryManager::getInstance().registerNode(new Stepper());
    return true;
}();