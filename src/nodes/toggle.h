#include <Arduino.h>
#include "../map/node.h"


//Toggle a bit
class Toggle : public Node
{
    public:
    ~Toggle(){};
    Toggle(int portNr = -1);
    bool isNotConnected = false;
    virtual std::string getType() const override {
        return "widget/toggle";
    }
    virtual Toggle* createInstance() const override {
        return new Toggle(*this); // Create a new instance of the Toggle object
    }
    void setup();
    void onExecute();
};

static bool toogleRegistered = []() {
    RegistryManager::getInstance().registerNode(new Toggle());
    return true;
}();
