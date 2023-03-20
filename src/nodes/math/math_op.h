#include <Arduino.h>

#include "../../map/node.h"

enum MathOpVariants { IsEq, IsGT, IsLT, Add };
// Inc/dec/reset an nteger
class MathOp : public Node
{
    public:
    MathOp(MathOpVariants variant = MathOpVariants::IsEq);
    virtual std::string getType() const override {
        return "basic/CompareValues";
    }
    virtual MathOp* createInstance() const override {
        return new MathOp(*this); // Create a new instance of the MathOp object
    }
    void setup(MathOpVariants variant);
    void onExecute();

    private:
    MathOpVariants myVariant;
};

static bool MathOpRegistered = []() {
    RegistryManager::getInstance().registerNode(new MathOp());
    return true;
}();
