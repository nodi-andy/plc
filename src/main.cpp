#include <Arduino.h>
#include <SPIFFS.h>
#include <WiFi.h>
#include <ESPAsyncWebServer.h>
#include <ArduinoJson.h>

#include "custom.h"
#include "nodes/widget/toggle.h"
#include "nodes/widget/button.h"
#include "nodes/math/counter.h"
#include "nodes/math/operation.h"
#include "nodes/link.h"
#include "map/map.h"

TaskHandle_t Task2;

#define BTN_PIN   0
#define HTTP_PORT 80
#define MAX_MESSAGE_SIZE 8192
// Button debouncing
const uint8_t DEBOUNCE_DELAY = 10; // in milliseconds

// WiFi credentials
const char *WIFI_SSID = WIFI_NAME;
const char *WIFI_PASS = WIFI_PW;
static uint8_t mapFile[MAX_MESSAGE_SIZE];
Map nodemap;
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
// Connecting to the WiFi network
// ----------------------------------------------------------------------------

void initWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  Serial.printf("Trying to connect [%s] ", WiFi.macAddress().c_str());
  while (WiFi.status() != WL_CONNECTED) {
      Serial.print(".");
      delay(500);
  }
  Serial.printf("Connected %s\n", WiFi.localIP().toString().c_str());
}

// ----------------------------------------------------------------------------
// Web server initialization
// ----------------------------------------------------------------------------

String processor(const String &var) {
    return String(var == "STATE" && onboard_led.on ? "on" : "off");
}

void onRootRequest(AsyncWebServerRequest *request) {
  request->send(SPIFFS, "/index.html", "text/html", false, processor);
}

void initWebServer() {
    server.on("/", onRootRequest);
    server.serveStatic("/", SPIFFS, "/");
    server.begin();
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

void initWebSocket() {
    ws.onEvent(onEvent);
    server.addHandler(&ws);
}


//Task2code: blinks an LED every 1000 ms
void Task2code( void * pvParameters ){
  Serial.print("Task1 running on core ");
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
            int idList[6];
            int i = 0;
            for (JsonVariant linkObj : kv.as<JsonArray>()) {
                idList[i] = linkObj.as<int>();
                i++;
            }
            nodemap.addLink(idList[0], idList[1], idList[2], idList[3], idList[4]);
        }

        nodemap.report();
        nodemap.state = mapState::RUN;
    }

    //delay(10);

               	
    
    if (nodemap.state == mapState::RUN) {
        for (auto n : nodemap.nodes) {
            if (n.second) {
                n.second->onExecute();
            }
        }
        for (auto n : nodemap.links) {
            if (n.second) {
                n.second->onExecute();
            }
        }
    }
  } 
}
// ----------------------------------------------------------------------------
// Initialization
// ----------------------------------------------------------------------------

void setup() {

    Serial.begin(115200);
    delay(100);

    initSPIFFS();
    initWiFi();
    initWebSocket();
    initWebServer();

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
                    Task2code,   /* Task function. */
                    "Task2",     /* name of task. */
                    20000,       /* Stack size of task */
                    NULL,        /* parameter of the task */
                    10,           /* priority of the task */
                    &Task2,      /* Task handle to keep track of created task */
                    1);          /* pin task to core 1 */

    /*nodemap.clear();
    Button* b = new Button();
    b->props["port"] = "0";
    nodemap.addNode(1, b);
    nodemap.addNode(2, new Toggle());*/
    //nodemap.addNode(3, new Counter());
    
    //MathOp* isEq = new MathOp(MathOpVariants::IsEq);
    //isEq->setInput(1, 5);
    //nodemap.addNode(4, isEq);

    //nodemap.addLink(5, 1, 0, 3, 0);
    //nodemap.addLink(6, 3, 0, 4, 0);
    //nodemap.addLink(7, 4, 0, 3, 1);
    //nodemap.report();

/*
    nodemap.clear();
    b = new Button();
    b->props["port"] = "0";
    nodemap.addNode(1, b);
    //nodemap.addNode(2, new Toggle(BUILTIN_LED));
    nodemap.addNode(3, new Counter());
    
    isEq = new MathOp(MathOpVariants::IsEq);
    isEq->setInput(1, 5);
    nodemap.addNode(4, isEq);

    nodemap.addLink(5, 1, 0, 3, 0);
    nodemap.addLink(6, 3, 0, 4, 0);
    nodemap.addLink(7, 4, 0, 3, 1);
    nodemap.report();*/
}

// ----------------------------------------------------------------------------
// Main control loop
// ----------------------------------------------------------------------------

void loop() {
    ws.cleanupClients();
}

