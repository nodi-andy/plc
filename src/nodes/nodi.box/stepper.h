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
        return "nodi.box/stepper";
    }

    void setup();
    int onExecute();

    private:
    int targetSpeed;
    int speed;
    static int dirPort;
    static int stepPort;
    int enablePort;
    static int dir;
    static int targetPos;
    static int reset;
    static int pos;
    int lastPos;
    static int updatePos;
    hw_timer_t *My_timer;
    int posGiven = 0, speedGiven = 0;

    static void IRAM_ATTR onTimer();
    void setSpeed(int newSpeed);
    int timerState = 0;
};

int Stepper::targetPos = 0;
int Stepper::reset = 0;
int Stepper::dir = 0;
int Stepper::pos = 0;
int Stepper::stepPort = 0;
int Stepper::dirPort = 0;
int Stepper::updatePos = 0;

static bool stepperRegistered = []() {
    RegistryManager::getInstance().registerNode(new Stepper());
    return true;
}();