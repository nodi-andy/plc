#define DEBUG_ESP_PORT

#include <Arduino.h>
#include <WiFiManager.h> // https://github.com/tzapu/WiFiManager
#include <ESPAsyncWebServer.h>
#include <ArduinoJson.h>
#include <Preferences.h>
#include "WiFi.h"
#include <ESP32Ping.h>

#include <WebSocketsClient.h>
#include <SocketIOclient.h>

SocketIOclient socketIO;


#define CONFIG_LITTLEFS_SPIFFS_COMPAT 1

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
const String defaultFileName = "/map.json";

static uint8_t wsInput[MAX_MESSAGE_SIZE];
static uint8_t mapFile[MAX_MESSAGE_SIZE];

Map nodemap;
Preferences preferences;
DynamicJsonDocument doc(10240);
JsonObject root;
JsonObject rootArray;

#define USE_SERIAL Serial

void loadNoditronFile() {
    //if (SPIFFS.exists(defaultFileName.c_str())) {
        //Serial.println("Default File found");
        File file = SPIFFS.open(defaultFileName, "w", true);
        if(!file){
            Serial.println("There was an error opening the file for reading");
        } else {
            file.read((uint8_t *)mapFile, file.size());  
            mapFile[file.size()] = 0;
                Serial.println("READ DONE: ");
                Serial.print(file.size());
                Serial.print(",");
                Serial.println((const char*)mapFile);
            file.close();
            nodemap.state = mapState::UPDATE;
        }	
    /*} else {
        Serial.println("Default File not found");
    }*/
}


void socketIOEvent(socketIOmessageType_t type, uint8_t * payload, size_t length) {
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
            nodemap.state = mapState::ID;
           
            break;
        case sIOtype_EVENT:
        { 
            id = strtol((char *)payload, &sptr, 10);
            //USE_SERIAL.printf("[IOc] get event: %s id: %d\n", payload, id);
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
            } else if (eventName == "updateNode") {
                nodemap.state = mapState::UPDATE_NODE;
            } else if (eventName == "addNode") {
                nodemap.state = mapState::ADD_NODE;
            } else if (eventName == "remNode") {
                nodemap.state = mapState::REM_NODE;
            } else if (eventName == "addLink") {
                nodemap.state = mapState::ADD_LINK;
            } else if (eventName == "remLink") {
                nodemap.state = mapState::REM_LINK;
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
//AsyncWebSocket ws("/ws");

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
    
    int AP_Enabled = 0; //preferences.getInt("AP_Enabled", 1);
    int STA_Enabled = 1; //preferences.getInt("STA_Enabled", 0);
    String SSID_stored = preferences.getString("SSID", "DHLAN");
    String PW_stored = preferences.getString("PW", "w123qweasd");
    pinMode(TRIGGER_PIN, INPUT_PULLUP);
    Serial.print("AP mode: ");
    Serial.println(AP_Enabled);
    Serial.print("STA mode: ");
    Serial.println(STA_Enabled);
    
    if(AP_Enabled && STA_Enabled) {
        WiFi.mode(WIFI_AP_STA);
    } else if (AP_Enabled && !STA_Enabled) {
        WiFi.mode(WIFI_AP);

    } else if (!AP_Enabled && STA_Enabled) {
        WiFi.mode(WIFI_STA);
    } else {
        WiFi.mode(WIFI_AP);
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
        Serial.print("Station loading: ");
        Serial.println(SSID_stored.c_str());
        Serial.println(PW_stored.c_str());
        WiFi.setHostname("noditron");
        WiFi.begin(SSID_stored.c_str(), PW_stored.c_str());
        Serial.printf("Trying to connect [%s] ", WiFi.macAddress().c_str());
        while (WiFi.status() != WL_CONNECTED) {
            Serial.print("WiFi Error");
            delay(500);
        }
        Serial.printf("Connected with the IP: %s\n", WiFi.localIP().toString().c_str());
    } else {
        Serial.print("Station turn off: ");
        WiFi.disconnect();
    }

}


// ----------------------------------------------------------------------------
// WebSocket initialization
// ----------------------------------------------------------------------------

void notifyClients(const char* msg) {
    if (msg) {
      //ws.textAll(wsInput, strlen((const char*)msg));
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
    //ws.textAll(msg.c_str(), msg.length());
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

        deserializeJson(doc, wsInput);
        root = doc.as<JsonObject>();
        if ( root["save"].isNull() == false) {
            notifyClients((const char*)mapFile);
            File file = SPIFFS.open(defaultFileName.c_str(), FILE_WRITE);
            Serial.print("INPUT: ");
            Serial.print(strlen((const char*)mapFile));
            Serial.print(",");
            Serial.println((char*)mapFile);
            file.write(mapFile, strlen((const char*)mapFile));
            file.close();
            loadNoditronFile();
        }
        if ( root["listWiFi"].isNull() == false) {
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
            //ws.textAll(msg.c_str(), msg.length());
        }
        if ( root["saveWiFi"].isNull() == false) {
            Serial.println("Save WiFi");
            preferences.putString("SSID", root["saveWiFi"]["SSID"].as<String>());
            preferences.putString("PW", root["saveWiFi"]["PW"].as<String>());
            preferences.putInt("STA_Enabled", 1);
            Serial.println(preferences.getInt("STA_Enabled", 0));
            initWiFi();
        }
        if ( root["Setting"].isNull() == false) {
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
        }
        if ( root["getConnectionSettings"].isNull() == false) {

            sendConnectionSettings();
        }
    }
}

void onEvent(AsyncWebSocket       *server,
             AsyncWebSocketClient *client,
             AwsEventType          type,
             void                 *arg,
             uint8_t              *data,
             size_t                len) {

    switch (type) {
        case WS_EVT_CONNECT:
            Serial.printf("WebSocket client #%u connected from %s\n", client->id(), client->remoteIP().toString().c_str());
            //ws.text(client->id(), mapFile, strlen((const char*)mapFile));
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


void initWebServer() {
    //ws.onEvent(onEvent);
    //server.addHandler(&ws);
    Serial.println("Starting web server...");
    server.serveStatic("/", SPIFFS, "/").setDefaultFile("index.html"); ;
    server.begin();
}

void noditronTask( void * pvParameters ) {
  Serial.print("noditron task is running on core: ");
  Serial.println(xPortGetCoreID());

  for(;;){
    //Serial.println(nodemap.state);

    if (nodemap.state == mapState::UPDATE) {
        nodemap.clear();

        memcpy(wsInput, mapFile, strlen((char *)mapFile));

        deserializeJson(doc, wsInput);
        JsonObject root = doc.as<JsonObject>();

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
            nodemap.addLink(id, fromNode, fromPort, toNode, toPort);
        }

        nodemap.report();
        nodemap.state = mapState::RUN;
    } else if (nodemap.state == mapState::ID) {
      String msg = "connected";
      String &rmsg = msg;
      socketIO.sendEVENT(rmsg);
      nodemap.state = mapState::RUN;
    } else if (nodemap.state == mapState::UPDATE_NODE) {
        int id = doc[1]["nodeID"].as<int>();
        USE_SERIAL.printf("[updateNode] id: %d\n", id);
        if (nodemap.nodes[id]) {
            USE_SERIAL.printf("[updateNode.found] id: %d\n", id);
            nodemap.nodes[id]->props = doc[1]["newData"];
            nodemap.nodes[id]->setup();
        }
        nodemap.state = mapState::RUN;
    } else if (nodemap.state == mapState::ADD_NODE) {
        int id = doc[1]["id"].as<int>();
        USE_SERIAL.printf("[addNode] id: %d\n", id);
        nodemap.addNode(doc[1]);
        nodemap.state = mapState::RUN;
    } else if (nodemap.state == mapState::REM_NODE) {
        int id = doc[1]["id"].as<int>();
        USE_SERIAL.printf("[remNode] id: %d\n", id);
        nodemap.state = mapState::RUN;
    } else if (nodemap.state == mapState::ADD_LINK) {
        int id = doc[1]["id"].as<int>();
        USE_SERIAL.printf("[addLink] id: %d\n", id);
        nodemap.state = mapState::RUN;
    } else if (nodemap.state == mapState::REM_LINK) {
        int id = doc[1]["id"].as<int>();
        USE_SERIAL.printf("[remLink] id: %d\n", id);
        nodemap.state = mapState::RUN;
    } else if (nodemap.state == mapState::RUN) {
        for (auto n : nodemap.nodes) {
            if (n.second) {
                if (n.second->onExecute()) {
                    std::string msg = "{\"update\": {\"id\":" + std::to_string(n.second->id) + ", \"state\":" + std::to_string(n.second->state) + ", \"value\":" + std::to_string(n.second->value) + "}}";
                    //ws.textAll(msg.c_str(), msg.length());
                }
            }
        }
        
        for (auto n : nodemap.links) {
            if (n.second) {
                n.second->onExecute();
            }
        }

        // Clean output after all links are done
        for (auto n : nodemap.nodes) {
            if (n.second) {
                for (auto output : n.second->outputs) {
                    n.second->setOutput(output.first, nullptr);
                    /*Serial.print("Clean output:" );
                    Serial.println(output.first.c_str());*/
                }
            }
        }
    } else if (nodemap.state == mapState::STOP) {
        nodemap.state = mapState::STOPPED;
    }
    vTaskDelay(10);
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
    //initWebServer();

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
    socketIO.begin("192.168.1.22", 8080, "/socket.io/?EIO=4");
    //socketIO.begin("noditron.com", 80, "/socket.io/?EIO=4");

    // event handler
    socketIO.onEvent(socketIOEvent);

    Serial.write("SocketIO: init");
}

// ----------------------------------------------------------------------------
// Main control loop
// ----------------------------------------------------------------------------

void loop() {
    //ws.cleanupClients();
    
    socketIO.loop();
}

