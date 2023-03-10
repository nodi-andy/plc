#include <Arduino.h>

#include "../map/node.h"

//Toggle a bit
class ConstantBoolean : public Node
{
    public:
    ConstantBoolean(int port);
    virtual std::string getType() const override {
        return "basic/ConstantBoolean";
    }
    virtual ConstantBoolean* createInstance() const override {
        return new ConstantBoolean(*this); // Create a new instance of the MathOp object
    }
    void setup();
    void onExecute();
};
