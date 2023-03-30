#include <Arduino.h>
#include "../../map/node.h"

class Interval : public Node
{
    public:
    ~Interval(){};
    Interval();
    virtual std::string getType() const override {
        return "time/interval";
    }
    virtual Interval* createInstance() const override {
        return new Interval(*this); // Create a new instance of the Button object
    }
    void setup();
    int onExecute();

    private:
    int defaultPressing;
    int defaultPressed;
    int defaultReleasing;
    int defaultReleased;
    int defaultTOn;
    int defaultTOff;
    int *ton;
    int *toff;
    int *input;
    int *output;
    int lastTick;
};

static bool intervalRegistered = []() {
    RegistryManager::getInstance().registerNode(new Interval());
    return true;
}();
