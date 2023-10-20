#pragma once
#include <string>
#include <ArduinoJson.h>
#include <map>
#include <unordered_map>
#include <vector>
#define NULL_DATA INT_MAX;
using namespace std;

// Base class for all FBs
class Node
{
    private:
      JsonObject widgets;
      StaticJsonDocument<2024> jsondoc;

    public:
    string jsonString;

      JsonObject props;
        virtual ~Node() {}
        virtual string getType() const = 0;
        virtual Node* createInstance() const = 0;
        static int const ON = 1;
        static int const OFF = 0;
        string name;
        string title;
        string desc;
        int id;
        int port = -1;
        int value = 0;
        int newvalue = 0;
        int state = 0;
        int newstate = 0;
        virtual void setup();
        virtual int onExecute();

        void setupVals();
        unordered_map<string, array<int, 3>> vals;
        void addProp(string name);
        void addInput(string name);
        void setInput(string name, int val);
        void clearInput(string name);
        int  getInput(string name);
        int  hasInput(string name);

        
        void addOutput(string name);
        int  getOutput(string name);
        void setOutput(string name, int val);

        void setProps(JsonObject props);
        JsonObject getProps();
        void setProp(string key, string name, int val);
        int  getProp(string key, string name = "value");

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