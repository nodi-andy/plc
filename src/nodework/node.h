#pragma once
#include <string>
#include <ArduinoJson.h>
#include <map>
#include <unordered_map>
#include <vector>
#include "enums.h"
class Map;

using namespace std;

#ifndef INT_MAX
    #define INT_MAX 2147483647
#endif

// Base class for all FBs
class Node
{
    public:
        virtual ~Node() {}
        virtual string getType() const = 0;
        virtual Node* createInstance() const = 0;
        virtual void reconnect(int x, int y) {};
    
        Map *parent;
        string type;
        string name;
        string title;
        string defaultInput = "value", defaultOutput = "value";
        NodiEnums::Direction dir = NodiEnums::Direction::RIGHT;
        int id;
        int size[2];
        virtual void setup();
        virtual vector<string> run();

        // INPUT
        unordered_map<string, std::map<int, tuple<int, bool>>> inputs;
        unordered_map<string, std::map<int, tuple<string, bool>>> inputStrs;
        int hasInput(string name);
        bool hasStrInput(string name);
        bool hasIntInput(string name);
        int  getInput(string name, int who = -1);
        string getStrInput(string name, int who = -1);
        void setInput(string inputName, int who, int val);
        void setInput(string inputName, int who, string val);
        void clearInput(string name = "");
        void clearInputsByNodeID(int nodeID);

        // VALUES
        void setupVals();
        unordered_map<string, int> vals;
        unordered_map<string, string> strVals;
        bool hasValue(string name);

        int  getValue(string name);
        string getStrValue(string name);
        void setValue(string name, int val);
        void setValue(string name, string val);
        void setValues(JsonObject props);

        // OUTPUT
        unordered_map<string, tuple<int, bool>> outputs;
        int  hasOutput(string name);
        int  getOutput(string name);
        void setOutput(string name, int val);
        void clearOutput(string name);

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

        Node* createNode(const string& type) {
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