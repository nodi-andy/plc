
#define TRIGGER_PIN 18
#define MAX_MESSAGE_SIZE 1024
#include <Arduino.h>


#ifdef WIFI_ENABLED

#include <WiFi.h>
#include <ESP32Ping.h>
#include <WiFiManager.h>
#include <ESPAsyncWebServer.h>
#include <WiFiClientSecure.h>
static uint8_t wsInput[MAX_MESSAGE_SIZE] = {0};
static uint8_t mapFile[MAX_MESSAGE_SIZE] = {0};


#ifdef WEBSOCKET_ENABLED
#include <WebSocketsClient.h>
#include <SocketIOclient.h>

SocketIOclient socketIO;
#define HTTP_PORT 80
AsyncWebServer server(HTTP_PORT);
AsyncWebSocket websocket("/ws");

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

void socketIOEvent(socketIOmessageType_t type, uint8_t * payload, size_t length) {
    switch(type) {
        case sIOtype_DISCONNECT:
            Serial.printf("[IOc] Disconnected!\n");
            break;
        case sIOtype_CONNECT:
            Serial.printf("[IOc] Connected to url: %s\n", payload);

            // join default namespace (no auto join in Socket.IO V3)
            socketIO.send(sIOtype_CONNECT, "/");
            break;
        case sIOtype_EVENT:
        {
            //nodemap.cmd(string((char*)payload));
        }
            break;
        case sIOtype_ACK:
            Serial.printf("[IOc] get ack: %u\n", length);
            break;
        case sIOtype_ERROR:
            Serial.printf("[IOc] get error: %u\n", length);
            break;
        case sIOtype_BINARY_EVENT:
            Serial.printf("[IOc] get binary: %u\n", length);
            break;
        case sIOtype_BINARY_ACK:
            Serial.printf("[IOc] get binary ack: %u\n", length);
            break;
    }
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

        //nodemap.cmd(string((char*)wsInput));
    }
}

void onEvent(AsyncWebSocket *server, AsyncWebSocketClient *client, AwsEventType type, void *arg, uint8_t *data, size_t len) {
    switch (type) {
        case WS_EVT_CONNECT:
            Serial.printf("WebSocket client #%u connected from %s\n", client->id(), client->remoteIP().toString().c_str());
            //websocket.text(client->id(), mapFile, strlen((const char*)mapFile));
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


#endif 
void initWiFi() {
    
    int AP_Enabled = 0; //preferences.getInt("AP_Enabled", 1);
    int STA_Enabled = 0; // preferences.getInt("STA_Enabled", 0);
    string SSID_stored = "";// preferences.getString("SSID", "");
    string PW_stored = "";//preferences.getString("PW", "");
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

void socketIOEvent(socketIOmessageType_t type, uint8_t * payload, size_t length) {
        char * sptr = NULL;
    String eventName, jsonData;
    File file;
    int id;
    DeserializationError error;
    switch(type) {
        case sIOtype_DISCONNECT:
            SERIAL.printf("[IOc] Disconnected!\n");
            break;
        case sIOtype_CONNECT:
            SERIAL.printf("[IOc] Connected to url: %s\n", payload);
           
            break;
        case sIOtype_EVENT:
        { 
            id = strtol((char *)payload, &sptr, 10);
            SERIAL.printf("[IOc] get event: %s id: %d\n", payload, id);
            if(id) {
              payload = (uint8_t *)sptr;
            }


            error = deserializeJson(doc, payload, length);
            if(error) {
                SERIAL.print(F("deserializeJson() failed: "));
                SERIAL.println(error.c_str());
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
            SERIAL.printf("[IOc] get ack: %u\n", length);
            break;
        case sIOtype_ERROR:
            SERIAL.printf("[IOc] get error: %u\n", length);
            break;
        case sIOtype_BINARY_EVENT:
            SERIAL.printf("[IOc] get binary: %u\n", length);
            break;
        case sIOtype_BINARY_ACK:
            SERIAL.printf("[IOc] get binary ack: %u\n", length);
            break;
    }

}

void notifyClients(const char* msg) {
    if (msg) {
      websocket.textAll(wsInput, strlen((const char*)msg));
    }
}

void initWebServer() {
    websocket.onEvent(onEvent);
    server.addHandler(&websocket);
    Serial.println("Starting web server...");
    server.serveStatic("/", SPIFFS, "/").setDefaultFile("index.html"); ;
    server.begin();
}

void sendConnectionSettings() {
    //preferences.begin("noditron", false); 
    int AP_Enabled = 0; //preferences.getInt("AP_Enabled", 1);
    int STA_Enabled = 0; //preferences.getInt("STA_Enabled", 0);
    String SSID_stored = ""; // preferences.getString("SSID", "");
    String PW_stored = ""; // preferences.getString("PW", "");
    //preferences.end();

    String msg = "{\"connectionSettings\": ";
    msg += "{\"AP_Enabled\": " + String(AP_Enabled) + ", ";
    msg += "\"STA_Enabled\": " + String(STA_Enabled) + ", ";
    msg += "\"SSID_stored\": \"" + SSID_stored + "\",";
    msg += "\"PW_stored\": \"" + PW_stored + "\",";
    msg += "\"STA_IP\": \"" + WiFi.localIP().toString() + "\"}";

    msg += "}";
    websocket.textAll(msg.c_str(), msg.length());
}
#endif
