#define DEBUG_ESP_PORT

#include <Arduino.h>
#include <WiFiManager.h> // https://github.com/tzapu/WiFiManager
#include <ESPAsyncWebServer.h>
#include <ArduinoJson.h>
#include <Preferences.h>
#include <WiFi.h>
#include <ESP32Ping.h>
#include <WiFiClientSecure.h>
#include <WebSocketsClient.h>
#include <SocketIOclient.h>

SocketIOclient socketIO;

#define CONFIG_LITTLEFS_SPIFFS_COMPAT 1
#define DEVICE_NAME "esp32mcu"

#include <FS.h>
#define SPIFFS LITTLEFS
#include <LITTLEFS.h> 

#include "map/map.h"

TaskHandle_t noditronTaskHandle;

#define BTN_PIN   0
#define TRIGGER_PIN 18
#define HTTP_PORT 80
#define MAX_MESSAGE_SIZE 8192
// Button debouncing
const uint8_t DEBOUNCE_DELAY = 10; // in milliseconds
#define defaultFileName  "/map.json"

static uint8_t wsInput[MAX_MESSAGE_SIZE];
static uint8_t mapFile[MAX_MESSAGE_SIZE];

Map nodemap;
Preferences preferences;
DynamicJsonDocument doc(10240);
JsonObject root;
JsonObject rootArray;

#define USE_SERIAL Serial

void loadNoditronFile() {
    if (SPIFFS.exists(defaultFileName)) {
        Serial.println("Default File found");
        File file = SPIFFS.open(defaultFileName);
        if(!file){
            Serial.println("There was an error opening the file for reading");
        } else {
            file.read((uint8_t *)mapFile, file.size());  
            mapFile[file.size()] = 0;
            Serial.printf("[Load Nodework] DONE: %d\r\n", file.size());
            file.close();
            nodemap.orders.push("[\"upload\", {}]");
        }	
    } else {
        Serial.println("Default File not found");
    }
}


/*void socketIOEvent(socketIOmessageType_t type, uint8_t * payload, size_t length) {
        char * sptr = NULL;
    String eventName, jsonData;
    File file;
    int id;
    DeserializationError error;
    switch(type) {
        case sIOtype_DISCONNECT:
            USE_SERIAL.printf("[IOc] Disconnected!\n");
            break;
        case sIOtype_CONNECT:
            USE_SERIAL.printf("[IOc] Connected to url: %s\n", payload);
           
            break;
        case sIOtype_EVENT:
        { 
            id = strtol((char *)payload, &sptr, 10);
            USE_SERIAL.printf("[IOc] get event: %s id: %d\n", payload, id);
            if(id) {
              payload = (uint8_t *)sptr;
            }


            error = deserializeJson(doc, payload, length);
            if(error) {
                USE_SERIAL.print(F("deserializeJson() failed: "));
                USE_SERIAL.println(error.c_str());
                break;
            }

            eventName = doc[0].as<String>();
            jsonData = doc[1].as<String>();


            Serial.print("INPUT: ");
            Serial.print(jsonData.length());
            Serial.print(",");
            Serial.println(jsonData.c_str());

            if (eventName == "setNodework") {
                jsonData.getBytes(mapFile, jsonData.length() + 1);
                file = SPIFFS.open(defaultFileName.c_str(), FILE_WRITE);
                file.write(mapFile, jsonData.length()+1);
                file.close();
                loadNoditronFile();
            }
            

        }
            break;
        case sIOtype_ACK:
            USE_SERIAL.printf("[IOc] get ack: %u\n", length);
            break;
        case sIOtype_ERROR:
            USE_SERIAL.printf("[IOc] get error: %u\n", length);
            break;
        case sIOtype_BINARY_EVENT:
            USE_SERIAL.printf("[IOc] get binary: %u\n", length);
            break;
        case sIOtype_BINARY_ACK:
            USE_SERIAL.printf("[IOc] get binary ack: %u\n", length);
            break;
    }

}
*/

void socketIOEvent(socketIOmessageType_t type, uint8_t * payload, size_t length) {
    switch(type) {
        case sIOtype_DISCONNECT:
            USE_SERIAL.printf("[IOc] Disconnected!\n");
            break;
        case sIOtype_CONNECT:
            USE_SERIAL.printf("[IOc] Connected to url: %s\n", payload);

            // join default namespace (no auto join in Socket.IO V3)
            socketIO.send(sIOtype_CONNECT, "/");
            break;
        case sIOtype_EVENT:
        {

            nodemap.orders.push(string((char*)payload));
            
        }
            break;
        case sIOtype_ACK:
            USE_SERIAL.printf("[IOc] get ack: %u\n", length);
            break;
        case sIOtype_ERROR:
            USE_SERIAL.printf("[IOc] get error: %u\n", length);
            break;
        case sIOtype_BINARY_EVENT:
            USE_SERIAL.printf("[IOc] get binary: %u\n", length);
            break;
        case sIOtype_BINARY_ACK:
            USE_SERIAL.printf("[IOc] get binary ack: %u\n", length);
            break;
    }
}
// ----------------------------------------------------------------------------
// Definition of the LED component
// ----------------------------------------------------------------------------

struct Led {
    // state variables
    uint8_t pin;
    bool    on;

    // methods
    void update() {
        digitalWrite(pin, on ? HIGH : LOW);
    }
};

// ----------------------------------------------------------------------------
// Definition of global variables
// ----------------------------------------------------------------------------

Led    onboard_led = { BUILTIN_LED, false };

AsyncWebServer server(HTTP_PORT);
AsyncWebSocket websocket("/ws");

// ----------------------------------------------------------------------------
// SPIFFS initialization
// ----------------------------------------------------------------------------

void initSPIFFS() {
  if (!SPIFFS.begin(true)) {
    Serial.println("Cannot mount SPIFFS volume...");
    while (1) {
        onboard_led.on = millis() % 200 < 50;
        onboard_led.update();
    }
  }
}

// ----------------------------------------------------------------------------
// Connecting to the WiFi network
// ----------------------------------------------------------------------------

void initWiFi() {
    
    int AP_Enabled = preferences.getInt("AP_Enabled", 1);
    int STA_Enabled = preferences.getInt("STA_Enabled", 0);
    String SSID_stored = preferences.getString("SSID", "");
    String PW_stored = preferences.getString("PW", "");
    pinMode(TRIGGER_PIN, INPUT_PULLUP);
    Serial.printf("AP_Enabled: %d\n", AP_Enabled);
    Serial.printf("STA_Enabled: %d\n", STA_Enabled);

    WiFi.mode(WIFI_AP);
    if (STA_Enabled) {
        if(AP_Enabled) {
            WiFi.mode(WIFI_AP_STA);
        } else {
            WiFi.mode(WIFI_STA);
        }
    }

    if (digitalRead(TRIGGER_PIN) == LOW || AP_Enabled) {
        Serial.println("Access point loading...");
        WiFi.softAPsetHostname("noditron");
        WiFi.softAP("noditron");
        Serial.print("AP Created with IP Gateway ");
        Serial.println(WiFi.softAPIP());
    }  

    if (STA_Enabled) {
        // STA MODE
        Serial.printf("Station loading: %s, %s\n", SSID_stored.c_str(), PW_stored.c_str());

        
        WiFi.setHostname("noditron");
        WiFi.begin(SSID_stored.c_str(), PW_stored.c_str());
        Serial.printf("Trying to connect [%s] ", WiFi.macAddress().c_str());
        while (WiFi.status() != WL_CONNECTED) {
            Serial.print("WiFi Error");
            delay(500);
        }
        Serial.printf("Connected with the IP: %s\n", WiFi.localIP().toString().c_str());
        
    } /*else {
        Serial.print("Station turn off: ");
        WiFi.disconnect();
    }*/

}


// ----------------------------------------------------------------------------
// WebSocket initialization
// ----------------------------------------------------------------------------

void notifyClients(const char* msg) {
    if (msg) {
      websocket.textAll(wsInput, strlen((const char*)msg));
    }
}

void sendConnectionSettings() {
    preferences.begin("noditron", false); 
    int AP_Enabled = preferences.getInt("AP_Enabled", 1);
    int STA_Enabled = preferences.getInt("STA_Enabled", 0);
    String SSID_stored = preferences.getString("SSID", "");
    String PW_stored = preferences.getString("PW", "");
    preferences.end();

    String msg = "{\"connectionSettings\": ";
    msg += "{\"AP_Enabled\": " + String(AP_Enabled) + ", ";
    msg += "\"STA_Enabled\": " + String(STA_Enabled) + ", ";
    msg += "\"SSID_stored\": \"" + SSID_stored + "\",";
    msg += "\"PW_stored\": \"" + PW_stored + "\",";
    msg += "\"STA_IP\": \"" + WiFi.localIP().toString() + "\"}";

    msg += "}";
    websocket.textAll(msg.c_str(), msg.length());
}

void handleWebSocketMessage(void *arg, uint8_t *data, size_t len) {
    AwsFrameInfo *info = (AwsFrameInfo*)arg;
    Serial.println("SocketMessage ...");
    if (info->index + len <= MAX_MESSAGE_SIZE) {
        memcpy(wsInput + info->index, data, len);
        Serial.println("Message segment received ...");
    } else {
        Serial.println("Message too large");
        return;
    }
   
    if (info->index + len == info->len && info->opcode == WS_TEXT) {
        Serial.println("Socket msg received completely.");
        wsInput[info->len] = 0;

        // ws input is modified if its given to deserializeJson, make a copy here
        memcpy(mapFile, wsInput, strlen((char *)wsInput));
        mapFile[info->len] = '\0';  // Add the null-terminator

        nodemap.orders.push(string((char*)wsInput));



    }
}

void onEvent(AsyncWebSocket *server, AsyncWebSocketClient *client, AwsEventType type, void *arg, uint8_t *data, size_t len) {
    switch (type) {
        case WS_EVT_CONNECT:
            Serial.printf("WebSocket client #%u connected from %s\n", client->id(), client->remoteIP().toString().c_str());
            websocket.text(client->id(), mapFile, strlen((const char*)mapFile));
            sendConnectionSettings();
            break;
        case WS_EVT_DISCONNECT:
            Serial.printf("WebSocket client #%u disconnected\n", client->id());
            break;
        case WS_EVT_DATA:
            handleWebSocketMessage(arg, data, len);
            break;
        case WS_EVT_PONG:
        case WS_EVT_ERROR:
            break;
    }
}
void sendToSocket(string msg) {
    socketIO.sendEVENT(msg.c_str());
    websocket.textAll(msg.c_str(), msg.length());
}

void initWebServer() {
    websocket.onEvent(onEvent);
    server.addHandler(&websocket);
    Serial.println("Starting web server...");
    server.serveStatic("/", SPIFFS, "/").setDefaultFile("index.html"); ;
    server.begin();
}

void noditronTask( void * pvParameters ) {
  Serial.print("noditron task is running on core: ");
  Serial.println(xPortGetCoreID());

  for(;;){
    //Serial.println(nodemap.state);
    
    if (nodemap.orders.size()) {
        DynamicJsonDocument djsondoc(4048);
        string order = nodemap.orders.front();
        nodemap.orders.pop();
        USE_SERIAL.printf("[nodework:new_order] : %s\n", order.c_str());

        char * sptr = NULL;
        int msgid = strtol(order.c_str(), &sptr, 10);
        if(msgid) order = sptr;
        deserializeJson(djsondoc, order.c_str(), order.length());
        String eventName = djsondoc[0];
        int id = djsondoc[1]["nodeID"].as<int>();
        USE_SERIAL.printf("[nodework:event] id: %d, name: %s\n", id, eventName.c_str());

        if (eventName == "upload") {
            nodemap.clear();

            //    jsonData.getBytes(mapFile, jsonData.length() + 1);
            //    file = SPIFFS.open(defaultFileName.c_str(), FILE_WRITE);
            //    file.write(mapFile, jsonData.length()+1);
            //    file.close();
            //    loadNoditronFile();

            //memcpy(wsInput, mapFile, strlen((char *)mapFile));

            char mapFileStr[sizeof(mapFile) + 1];  // +1 for the null terminator
            memcpy(mapFileStr, mapFile, sizeof(mapFile));
            mapFileStr[sizeof(mapFile)] = '\0';  // Null-terminate the string

            USE_SERIAL.printf("[Event::upload] mapFile: %s\n", mapFileStr);

            deserializeJson(djsondoc, mapFile);
            JsonObject root = djsondoc.as<JsonObject>();

            JsonArray nodes = root["nodes"];
            for (JsonVariant kv : nodes) {
                JsonObject node = kv.as<JsonObject>();
                nodemap.addNode(node);
            }

            JsonArray links = root["links"];
            for (JsonVariant kv : links) {
                JsonArray linkData = kv.as<JsonArray>();
                int id = linkData[0].as<int>();
                int fromNode = linkData[1].as<int>();
                std::string fromPort = linkData[2].as<std::string>();
                int toNode = linkData[3].as<int>();
                std::string toPort = linkData[4].as<std::string>();
                nodemap.addLink(fromNode, fromPort, toNode, toPort, &id);
            }

            nodemap.report();
        } else if (eventName == "getNodework") {
            StaticJsonDocument<2024> jsondoc;
            JsonArray array = jsondoc.to<JsonArray>();
            array.add("setNodework");

            JsonObject map = array.createNestedObject();

            map["nodes"] = array.createNestedArray();
            for (auto n : nodemap.nodes) {
                JsonObject newNode = map["nodes"].createNestedObject();
                newNode["type"] = n.second->getType();
                newNode["properties"] = n.second->getProps();
            }

            JsonArray jsonLinks = array.createNestedArray();
            for (auto n : nodemap.links) {
                jsonLinks.add(n.second->getProps());
            }

            string msg;
            serializeJson(jsondoc, msg);
            socketIO.sendEVENT(msg.c_str());
            USE_SERIAL.printf("[getMap] : %s\n", msg.c_str());
        } else if (eventName == "clear") {
            nodemap.clear();
        } else if (eventName == "id") {

            string msg;

            StaticJsonDocument<512> sjsondoc;
            JsonArray arr = sjsondoc.to<JsonArray>();
            arr.add("id");

            JsonObject data = arr.createNestedObject();
            data["id"] = DEVICE_NAME;

            serializeJson(sjsondoc, msg);
            USE_SERIAL.printf("[id.response] : %s\n", msg.c_str());
            sendToSocket(msg);
        } else if (eventName == "updateMe") {
            
        } else if (eventName == "moveNode") {
            //USE_SERIAL.printf("[nodework:move] name: %s\n", eventName.c_str());
            
        } else if (eventName == "updateNode") {
            USE_SERIAL.printf("[updateNode] id: %d\n", id);
            if (nodemap.nodes[id]) {
                USE_SERIAL.printf("[updateNode.found] id: %d\n", id);
                nodemap.nodes[id]->setProps(djsondoc[1]["newData"]["properties"]);
            }
        } else if (eventName == "updateSlot") {
            USE_SERIAL.printf("[updateSlot] id: %d\n", id);
            if (nodemap.nodes[id]) {
                USE_SERIAL.printf("[updateSlot.found] id: %d\n", id);
                nodemap.nodes[id]->setInput(djsondoc[1]["newData"]["prop"].as<string>(), djsondoc[1]["newData"]["value"].as<int>());
            }
        } else if (eventName == "addNode") {
            StaticJsonDocument<2024> jsondoc;
            JsonArray array = jsondoc.to<JsonArray>();
            array.add("nodeAdded");
            
            //int newID = nodemap.getID();
            USE_SERIAL.printf("[event::addNode] id: %d\n", djsondoc[1].as<int>());
            Node *newNode = nodemap.addNode(djsondoc[1]);
            if (newNode) {
              djsondoc[1]["nodeID"] = newNode->id;
            }

            array.add(djsondoc[1]);
            string msg;
            serializeJson(jsondoc, msg);
            sendToSocket(msg);
        } else if (eventName == "movedNode") {
            nodemap.nodes[id]->posX = djsondoc[1]["moveTo"]["pos"][0].as<int>();
            nodemap.nodes[id]->posY = djsondoc[1]["moveTo"]["pos"][1].as<int>();

            USE_SERIAL.printf("[nodework:moved] name: %s\n", eventName.c_str());
            
        } else if (eventName == "remNode") {
            USE_SERIAL.printf("[remNode] id: %d\n", id);
        } else if (eventName == "addLink") {
            int fromNode        = djsondoc[1]["from"].as<int>();
            int toNode          = djsondoc[1]["to"].as<int>();
            string fromPort     = djsondoc[1]["fromSlot"].as<string>();
            string toPort       = djsondoc[1]["toSlot"].as<string>();
            Link* newLink = nodemap.addLink(fromNode, fromPort, toNode, toPort);
            if (newLink) {
              djsondoc[1]["nodeID"] = newLink->id;
            }

            StaticJsonDocument<2024> responseJSON;
            JsonArray array = responseJSON.to<JsonArray>();
            array.add("linkAdded");
            array.add(djsondoc[1]);
            string msg;
            serializeJson(responseJSON, msg);
            sendToSocket(msg);
            USE_SERIAL.printf("[addLink] id: %d\n", id);
        } else if (eventName == "remlink") {
            int id = doc[1]["id"].as<int>();
            USE_SERIAL.printf("[remLink] id: %d\n", id);
        } else if (eventName == "save") {
            String mapJSON = nodemap.toJSON().c_str();

            File file = SPIFFS.open(defaultFileName, FILE_WRITE);
            int size = file.print(mapJSON);

            if (size != mapJSON.length()) {
                USE_SERIAL.println("Error writing to file");
            }
            file.close();
            USE_SERIAL.printf("[Event:save] %d: %d,  %s\n", size, mapJSON.length(), mapJSON.c_str());
        } else if (eventName == "listWiFi") {
            int n = WiFi.scanNetworks();
            Serial.println("scan done");
            std::string msg = "{\"updateWiFi\": {\"list\": [" ;

            if (n == 0) {
                Serial.println("no networks found");
            } else {
                Serial.print(n);
                Serial.println(" networks found");
                for (int i = 0; i < n; ++i) {
                    // Print SSID and RSSI for each network found
                    Serial.print(i + 1);
                    Serial.print(": ");
                    Serial.print(WiFi.SSID(i));
                    Serial.print(" (");
                    Serial.print(WiFi.RSSI(i));
                    Serial.print(")");
                    Serial.println((WiFi.encryptionType(i) == WIFI_AUTH_OPEN)?" ":"*");
                    delay(10);
                    msg += "\"";
                    msg += WiFi.SSID(i).c_str();
                    msg += "\"";
                    
                    if (i < n-1) {
                        msg += ",";
                    }
                }
            }

            msg += "]}}";
            websocket.textAll(msg.c_str(), msg.length());
        } else if (eventName == "settings") {
            Serial.println("Save WiFi");
            preferences.putString("SSID", root["saveWiFi"]["SSID"].as<String>());
            preferences.putString("PW", root["saveWiFi"]["PW"].as<String>());
            preferences.putInt("STA_Enabled", 1);
            Serial.println(preferences.getInt("STA_Enabled", 0));
            initWiFi();
        } else if (eventName == "saveWiFi") {
            preferences.begin("noditron", false); 

            for (JsonPair setting : root["Setting"].as<JsonObject>()) {
                Serial.print("Setting: ");
                Serial.println(setting.key().c_str());
                if (setting.value().is<int>() || setting.value().is<bool>()) {
                    preferences.putInt(setting.key().c_str(), setting.value().as<int>());
                    Serial.println(setting.value().as<int>());
                    Serial.println(preferences.getInt(setting.key().c_str()));
                } else {
                    preferences.putString(setting.key().c_str(), setting.value().as<String>());
                    Serial.println(setting.value().as<String>());
                    Serial.println(preferences.getString(setting.key().c_str()));
                }

                if (setting.key() == "STA_Enabled") {
                    initWiFi();
                }
            }
            preferences.end();
            sendConnectionSettings();
        } else if (eventName == "getConnectionSettings") {
            sendConnectionSettings();
        }
    }

    for (auto n : nodemap.nodes) {
        if (n.second == nullptr) continue;
        if (n.second->onExecute()) {
            string msg;

            StaticJsonDocument<512> sjsondoc;
            JsonArray arr = sjsondoc.to<JsonArray>();
            arr.add("updateNode");

            JsonObject data = arr.createNestedObject();

            data["nodeID"] = n.second->id;
            JsonObject newData = data.createNestedObject("newData");
            newData["properties"] = n.second->getProps();
            arr.add(data);
            
            serializeJson(sjsondoc, msg);
            sendToSocket(msg);
            USE_SERIAL.printf("[Run:updateNode] id: %s\n", msg.c_str());
        }
    }
    
    for (auto n : nodemap.links) {
        if (n.second) {
            n.second->onExecute();
        }
    }

    // Clean output after all links are done
    for (auto n : nodemap.nodes) {
        Node *node = n.second;
        if (node) {
            JsonObject props = node->getProps();

            for (JsonPair p : props) {
                string propName = p.key().c_str();
                node->setProp(propName, "outValue", INT_MAX);
            }
        }
    }

    vTaskDelay(50);
  } 
}


void hexdump(const void *mem, uint32_t len, uint8_t cols = 16) {
	const uint8_t* src = (const uint8_t*) mem;
	Serial.printf("\n[HEXDUMP] Address: 0x%08X len: 0x%X (%d)", (ptrdiff_t)src, len, len);
	for(uint32_t i = 0; i < len; i++) {
		if(i % cols == 0) {
			Serial.printf("\n[0x%08X] 0x%08X: ", (ptrdiff_t)src, i);
		}
		Serial.printf("%02X ", *src);
		src++;
	}
	Serial.printf("\n");
}

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {


    switch(type) {
        case WStype_DISCONNECTED:
            Serial.printf("[WSc] Disconnected!\n");
            break;
        case WStype_CONNECTED:
            {
                Serial.printf("[WSc] Connected to url: %s\n",  payload);
                // send message to server when Connected

            }
            break;
        case WStype_TEXT:
            Serial.printf("[WSc] get text: %s\n", payload);

			// send message to server
			// webSocket.sendTXT("message here");
            break;
        case WStype_BIN:
            Serial.printf("[WSc] get binary length: %u\n", length);
            hexdump(payload, length);

            // send data to server
            // webSocket.sendBIN(payload, length);
            break;
		case WStype_ERROR:			
            Serial.printf("[WSc] Err: %s\n", payload);
		case WStype_FRAGMENT_TEXT_START:
		case WStype_FRAGMENT_BIN_START:
		case WStype_FRAGMENT:
		case WStype_FRAGMENT_FIN:
			break;
    }

}
// ----------------------------------------------------------------------------
// Initialization
// ----------------------------------------------------------------------------

void setup() {
    memset(wsInput, 0, MAX_MESSAGE_SIZE);  // Fill the array with zeros
    memset(mapFile, 0, MAX_MESSAGE_SIZE);  // Fill the array with zeros

    Serial.begin(115200);
    preferences.begin("noditron", false); 
    initSPIFFS();
    initWiFi();
    initWebServer();

    preferences.end();

    xTaskCreatePinnedToCore(noditronTask, "noditron task", 20000, NULL, 10, &noditronTaskHandle, 1);
    delay(100);

    loadNoditronFile();
    bool success = Ping.ping("noditron.com", 3);
 
    if(!success){
        Serial.println("noditron.com: NC");
        return;
    }
    
    Serial.println("noditron.com: OK");

    delay(100);
    
    // server address, port and URL
    //socketIO.begin("192.168.1.22", 8080, "/socket.io/?EIO=4");
    //socketIO.begin("noditron.com", 80, "/socket.io/?EIO=4");

    // event handler
    //socketIO.onEvent(socketIOEvent);

    Serial.write("SocketIO: init");
}

// ----------------------------------------------------------------------------
// Main control loop
// ----------------------------------------------------------------------------
unsigned long messageTimestamp = 0;

void loop() {
    websocket.cleanupClients();
    
    socketIO.loop();
    uint64_t now = millis();


    if(now - messageTimestamp > 5000) {
        messageTimestamp = now;
/*
        // creat JSON message for Socket.IO (event)
        DynamicJsonDocument doc(1024);
        JsonArray array = doc.to<JsonArray>();

        // add evnet name
        // Hint: socket.on('event_name', ....
        array.add("event_name");

        // add payload (parameters) for the event
        JsonObject param1 = array.createNestedObject();
        param1["now"] = (uint32_t) now;

        // JSON to String (serializion)
        String output;
        serializeJson(doc, output);

        // Send event
        //socketIO.sendEVENT(output);*/
        USE_SERIAL.printf("Nodes: %d, Links: %d\n", nodemap.nodes.size(), nodemap.links.size());

        // Print JSON for debugging
        //USE_SERIAL.println(output);
        //USE_SERIAL.println(nodemap.nodes.size());
    }
}

