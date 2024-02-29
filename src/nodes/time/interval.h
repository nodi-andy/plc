#include <Arduino.h>
#include "../../nodework/node.h"

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
    vector<string> run();

    private:
    int state;
    int value;
    int ton;
    int toff;
    int lastTick;
    const int rtFactor = 1000;
};

static bool intervalRegistered = []() {
    RegistryManager::getInstance().registerNode(new Interval());
    return true;
}();
