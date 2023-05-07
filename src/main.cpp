#include <Arduino.h>
#include <WiFiManager.h> // https://github.com/tzapu/WiFiManager
#include <ESPAsyncWebServer.h>
#include <ArduinoJson.h>
#include <Preferences.h>
#include "WiFi.h"

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

static uint8_t mapFile[MAX_MESSAGE_SIZE];
Map nodemap;

// wifimanager can run in a blocking mode or a non blocking mode
// Be sure to know how to process loops with no delay() if using non blocking
bool wm_nonblocking = false; // change to true to use non blocking
WiFiManager wm; 
WiFiManagerParameter custom_field; // global param ( for non blocking w params )
Preferences preferences;

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
AsyncWebSocket ws("/ws");

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
// WebSocket initialization
// ----------------------------------------------------------------------------

void notifyClients() {
    ws.textAll(mapFile, strlen((const char*)mapFile));
}

void handleWebSocketMessage(void *arg, uint8_t *data, size_t len) {
    AwsFrameInfo *info = (AwsFrameInfo*)arg;
    Serial.println("SocketMessage ...");
    if (info->index + len <= MAX_MESSAGE_SIZE) {
        memcpy(mapFile + info->index, data, len);
    } else {
        Serial.println("Message too large");
        return;
    }
   
    if (info->index + len == info->len && info->opcode == WS_TEXT) {
        
        Serial.println("Writing...");
        File file = SPIFFS.open("/map.json", FILE_WRITE);
        const uint8_t *writeData = data;
        file.write(writeData, len);
        mapFile[info->len] = 0;
        file.close();
        notifyClients();
        Serial.print("INPUT: ");
        Serial.println((char*)mapFile);
        nodemap.state = mapState::UPDATE;
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
            ws.text(client->id(), mapFile, strlen((const char*)mapFile));
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

// ----------------------------------------------------------------------------
// Web server initialization
// ----------------------------------------------------------------------------

String processor(const String &var) {
    return String(var == "STATE" && onboard_led.on ? "on" : "off");
}

void initWebServer() {
    ws.onEvent(onEvent);
    server.addHandler(&ws);
    Serial.println("Starting web server...");
    server.serveStatic("/", SPIFFS, "/").setDefaultFile("index.html"); ;
    server.begin();
}
// ----------------------------------------------------------------------------
// Connecting to the WiFi network
// ----------------------------------------------------------------------------

void initWiFi() {
    // custom menu via array or vector
    // 
    // menu tokens, "wifi","wifinoscan","info","param","close","sep","erase","restart","exit" (sep is seperator) (if param is in menu, params will not show up in wifi page!)
    // const char* menu[] = {"wifi","info","param","sep","restart","exit"}; 
    // wm.setMenu(menu,6);
    std::vector<const char *> menu = {"wifi","info","param","sep","restart","exit"};
    wm.setMenu(menu);
 
    wm.setClass("invert"); // set dark theme
    
    char wifiMode = preferences.getChar("WIFI_MODE", 'A');
    pinMode(TRIGGER_PIN, INPUT_PULLUP);
    Serial.print("Selected wifi mode: ");
    Serial.println(wifiMode);
    // AP MODE, Config
    if ( digitalRead(TRIGGER_PIN) == LOW || (wm.getWiFiIsSaved() == false && wifiMode == 'A')) {
        
        Serial.println("WiFi Config Portal loading...");
        wm.setHostname("noditron");
       
        // set configportal timeout
        wm.setConfigPortalTimeout(120);

        if (!wm.startConfigPortal("noditron")) {
            Serial.println("failed to connect and hit timeout");
            delay(3000);
            //reset and try again, or maybe put it to deep sleep
            ESP.restart();
            delay(5000);
        }
        preferences.putChar("WIFI_MODE", 'S');
        //if you get here you have connected to the WiFi
        Serial.printf("Connected after Config Portal with the IP: %s\n", WiFi.localIP().toString().c_str());
    } else if (wm.getWiFiIsSaved() == false && wifiMode == 'A') {
        Serial.println("Access point loading...");
        WiFi.softAPsetHostname("noditron");
        WiFi.mode(WIFI_AP);
        WiFi.softAP("noditron");
        initWebServer();
        Serial.print("AP Created with IP Gateway ");
        Serial.println(WiFi.softAPIP());
    }  else {
        // STA MODE
        Serial.println("Station loading...");
        wm.setHostname("noditron");
        WiFi.mode(WIFI_STA);
        wm.autoConnect();
        initWebServer();
        Serial.printf("Trying to connect [%s] ", WiFi.macAddress().c_str());
        while (WiFi.status() != WL_CONNECTED) {
            Serial.print("WiFi Error");
            delay(500);
        }
        Serial.printf("Connected with the IP: %s\n", WiFi.localIP().toString().c_str());
    }

}

void noditronTask( void * pvParameters ){
  Serial.print("noditron task is running.");
  Serial.println(xPortGetCoreID());

  for(;;){
    //Serial.println(nodemap.state);

    if (nodemap.state == mapState::UPDATE) {
        DynamicJsonDocument doc(10240);
        deserializeJson(doc, mapFile);
        JsonObject root = doc.as<JsonObject>();
        JsonObject saved = root["save"];    

        nodemap.clear();

        JsonArray nodes = saved["nodes"];
        for (JsonVariant kv : nodes) {
            JsonObject node = kv.as<JsonObject>();
            nodemap.addNode(node);
        }

        JsonArray links = saved["links"];
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
    }

    //delay(1000);

               	
    
    if (nodemap.state == mapState::RUN) {
        for (auto n : nodemap.nodes) {
            if (n.second) {
                if (n.second->onExecute()) {
                    std::string msg = "{\"update\": {\"id\":" + std::to_string(n.second->id) + ", \"state\":" + std::to_string(n.second->state) + ", \"value\":" + std::to_string(n.second->value) + "}}";
                    ws.textAll(msg.c_str(), msg.length());
                }
            }
        }
        for (auto n : nodemap.links) {
            if (n.second) {
                n.second->onExecute();
            }
        }
        for (auto n : nodemap.nodes) {
            if (n.second) {
                for (auto output : n.second->outputs) {
                    n.second->setOutput(output.first, nullptr);
                    /*Serial.print("Clean output:" );
                    Serial.println(output.first.c_str());*/
                }
            }
        }
    }
    vTaskDelay(10);
  } 
}
// ----------------------------------------------------------------------------
// Initialization
// ----------------------------------------------------------------------------

void setup() {

    Serial.begin(115200);
    preferences.begin("noditron", false); 
    initSPIFFS();
    initWiFi();
    preferences.end();


    File file = SPIFFS.open("/map.json");
    if(!file){
        Serial.println("There was an error opening the file for reading");
    } else {
        file.read((uint8_t *)mapFile, file.size());  
        mapFile[file.size()] = 0;
        Serial.print((const char*)mapFile);
        Serial.println("READ DONE");
    }	
    file.close();

    xTaskCreatePinnedToCore(
                    noditronTask,   /* Task function. */
                    "noditron task",     /* name of task. */
                    20000,       /* Stack size of task */
                    NULL,        /* parameter of the task */
                    10,           /* priority of the task */
                    &noditronTaskHandle,      /* Task handle to keep track of created task */
                    1);          /* pin task to core 1 */
}

// ----------------------------------------------------------------------------
// Main control loop
// ----------------------------------------------------------------------------

void loop() {
    ws.cleanupClients();
}

