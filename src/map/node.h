#pragma once
#include <string>
#include <ArduinoJson.h>
#include <map>
#include <unordered_map>
#include <vector>

// Base class for all FBs
class Node
{
    public:
        virtual ~Node() {}
        virtual std::string getType() const = 0;
        virtual Node* createInstance() const = 0;
        static int const ON = 1;
        static int const OFF = 0;
        JsonObject props;
        std::string name;
        std::string title;
        std::string desc;
        int id;
        int port = -1;
        int value = 0;
        int newvalue = 0;
        int state = 0;
        int newstate = 0;
        bool multipleInput = false;
        virtual void setup();
        virtual int onExecute();
        void addInput(std::string name);
        void addOutput(std::string name);
        void addInput(int* val);
        void setInput(int name, int* val);
        int* getOutput(int name);
        static std::unordered_map<std::string, Node*> nodeReg;
        std::vector<int*> outputs;

    protected:
        std::vector<int*> inputs;
        int* getInput(int name);
        void setOutput(int name, int* val);
};


class RegistryManager {
public:
    static RegistryManager& getInstance() {
        static RegistryManager instance;
        return instance;
    }

    void registerNode(Node* node) {
        nodes_[node->getType()] = node;
    }

    Node* createNode(const std::string& type) {
        auto it = nodes_.find(type);
        if (it != nodes_.end()) {
            return it->second->createInstance();
        } else {
            return nullptr;
        }
    }

private:
    RegistryManager() {}
    std::map<std::string, Node*> nodes_;
};