#include "nodework/nodework.h"
#include <Arduino.h>
#include <Preferences.h>
#include <SPIFFS.h> 
#include <FS.h>
//#define CONFIG_LITTLEFS_SPIFFS_COMPAT 1

//#define SPIFFS LITTLEFS
//#include <LITTLEFS.h> 

#define MAX_MESSAGE_SIZE 8192
uint8_t mapFile[1024];
unsigned long messageTimestamp = 0;

// TaskHandle_t noditronTaskHandle;
Map nodemap;
Preferences preferences;
//JsonObject root;


void loadNoditronFile() {
    if (SPIFFS.exists(defaultFileName)) {
        Serial.println("Default File found");
        File file = SPIFFS.open(defaultFileName);
        if(!file){
            Serial.println("There was an error opening the file for reading");
        } else {
            file.read((uint8_t *)mapFile, file.size());  
            //mapFile[(uint8_t)file.size()] = 0;
            file.close();
            string nodeWorkJson = "[\"upload\", ";
            nodeWorkJson += (char*)mapFile;
            nodeWorkJson += "]";
            Serial.printf("[loadNoditronFile] : %s\r\n", nodeWorkJson);

            nodemap.cmd(nodeWorkJson);
        }	
    } else {
        Serial.println("Default File not found");
    }
}

void initSPIFFS() {
  if (!SPIFFS.begin(true)) {
    Serial.println("Cannot mount SPIFFS volume...");
  }
}

void noditronTask( void * pvParameters ) {
  Serial.print("noditron task is running on core: ");
  //Serial.println(xPortGetCoreID());

  for(;;){
    //nodemap.run();
    //Serial.println(nodemap.state);
    /*
  else
    
    if (eventName == "listWiFi") {
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
*/
    //vTaskDelay(5);
  } 
}

void setup() {
    Serial.begin(115200);
    Serial.println("noditron:loaded");

    //preferences.begin("noditron", false); 
    initSPIFFS();
    /*
    #ifdef WIFI_ENABLED
        initWiFi();
        initWebServer();
        bool success = Ping.ping("noditron.com", 3);
 
        if(!success){
            Serial.println("noditron.com: NC");
            return;
        }
        
        Serial.println("noditron.com: OK");
    #endif*/
    //preferences.end();

    //xTaskCreatePinnedToCore(noditronTask, "noditron task", 20000, NULL, 10, &noditronTaskHandle, 1);
    //xTaskCreate(noditronTask, "noditron task", 20000, NULL, 10, &noditronTaskHandle);
    delay(100);

    loadNoditronFile();
    
    // server address, port and URL
    //socketIO.begin("192.168.1.22", 8080, "/socket.io/?EIO=4");
    //socketIO.begin("noditron.com", 80, "/socket.io/?EIO=4");

    // event handler
    //socketIO.onEvent(socketIOEvent);

    Serial.write("SocketIO: init");
}

void loop() {
    #ifdef WEBSOCKET_ENABLED
        websocket.cleanupClients();
        socketIO.loop();
    #endif 

    uint64_t now = millis();

    if (Serial.available() > 0) {
        // read the incoming string:
        String incomingString = Serial.readStringUntil('\n');
        nodemap.cmd(incomingString.c_str());
    }

    nodemap.run();

    if(now - messageTimestamp > 5000) {
        messageTimestamp = now;
        Serial.printf("[\"ping\", {\"ts\": %d, \"n\": %d}]: ", now, nodemap.nodes.size());
        Serial.printf("nodemap:");
        for (auto n : nodemap.nodesByPos) {
            Serial.printf("[%d, %d]: %d , ", n.first.first, n.first.second, n.second);
        }
        Serial.printf("\n");

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
        //socketIO.sendEVENT(output);

        // Print JSON for debugging
        //SERIAL.println(output);
        //SERIAL.println(nodemap.nodes.size());*/
    }
}

