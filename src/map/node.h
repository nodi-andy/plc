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
        JsonObject props;
        std::string name;
        std::string title;
        std::string desc;
        int id;
        int value;
        int port = -1;
        virtual void setup();
        virtual void onExecute();
        void addInput(std::string name);
        void addOutput(std::string name);
        void setInput(int name, int val);
        int getOutput(int name);
        static std::unordered_map<std::string, Node*> nodeReg;

    protected:
        std::vector<int> inputs;
        std::vector<int> outputs;
        int getInput(int name);
        void setOutput(int name, int val);
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