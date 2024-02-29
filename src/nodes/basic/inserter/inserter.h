#include <Arduino.h>
#include "../../../nodework/node.h"
#include "../../../nodework/nodework.h"

class Inserter : public Node
{
    public:
    Inserter();
    virtual std::string getType() const override {
        return "basic/inserter";
    }
    virtual Inserter* createInstance() const override {
        return new Inserter(*this); // Create a new instance of the Toggle object
    }
    void setup();
    vector<string> run();

    void reconnect();
    NodiEnums::Direction dir = NodiEnums::Direction::RIGHT;
    Node *target = nullptr;
    Node *source = nullptr;
    string targetPortName = "value";
};

static bool InserterRegistered = []() {
    RegistryManager::getInstance().registerNode(new Inserter());
    return true;
}();
