#pragma once
#include <Arduino.h>

#include "../map/node.h"

//link nodes
class Link : public Node
{
    public:
    Link(Node* from, int src, Node* to, int dst);
    virtual Link* createInstance() const override {
        return new Link(*this); // Create a new instance of the Link object
    }
    virtual std::string getType() const override {
        return "link";
    }
    void setup();
    void onExecute();

    private:
    Node* from;
    Node* to;
    int src;
    int dst;
};
