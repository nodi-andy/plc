import { globalApp } from "./enums.mjs";

import NodeWork from "./nodework.mjs";
import NodiBoxB1 from "./nodes/nodi.box/b1.js";
import NodiBoxB2 from "./nodes/nodi.box/b2.js";
import NodiBoxB3 from "./nodes/nodi.box/b3.js";
import NodiBoxB4 from "./nodes/nodi.box/b4.js";
import NodiBoxGreen from "./nodes/nodi.box/green.js";
import NodiBoxYellow from "./nodes/nodi.box/yellow.js";
import Stepper from "./nodes/nodi.box/stepper.js";
import esp32mcuB1 from "./nodes/esp32mcu/b1.js";
import esp32mcuLED from "./nodes/esp32mcu/bit.js";

window.serialline = (msg) => {
  console.dlog("uC:", msg);
  msg = msg.trim();
  try {
    let [cmd, data] = JSON.parse(msg);
    if (NodeWork[cmd]) NodeWork[cmd](window.serialNodeWork, data);
  } catch (e) {
    //console.log("msg parsing error: ", e);
  }
}


const websocket = new WebSocket(`ws://${window.location.hostname}/ws`);
websocket.addEventListener("error", (event) => {
  console.dlog("WebSocket error: ", event);
});
// Connect to IoT
var uri = window.location.hostname;
if (window.location.hostname.includes(".") == false || window.location.hostname == "127.0.0.1") uri += ":8080";

// Connect to the socketIO server on cloud
if (io) window.socketIO = io(uri);


window.order = {};

if (window.socketIO) {
  // Event handler for when the connection is established
  window.socketIO.on("connect", () => {
    console.dlog("Connected to the socketIO server!");
    window.socket = window.socketIO;
    window.socket.emit("getNode", {roomId: window.currentNodeWork.uid});
  });

  window.socketIO.on("setNodelist", (message) => {
    globalApp.data.nodeContainer = message;
  });

  window.socketIO.on("id", () => {
    window.sendToNodework("id", { id: "browser" });
  });

  window.socketIO.on("createRoom", (msg) => {
    window.location.href = window.location.origin + window.location.pathname + '?map=' + msg;
  });
}

window.order.id = (message) => {
  if (message.id == "nodi.box") {
    NodeWork.registerNodeType(NodiBoxB1);
    NodeWork.registerNodeType(NodiBoxB2);
    NodeWork.registerNodeType(NodiBoxB3);
    NodeWork.registerNodeType(NodiBoxB4);
    NodeWork.registerNodeType(NodiBoxGreen);
    NodeWork.registerNodeType(NodiBoxYellow);
    NodeWork.registerNodeType(Stepper);
  } else if (message.id == "esp32mcu") {
    NodeWork.registerNodeType(esp32mcuB1);
    NodeWork.registerNodeType(esp32mcuLED);
  }
  window.updateNodeList();
};

window.order.updateNode = (message) => {
  // Handle incoming messages here
  if (window.nodeWork.nodes[message.nodeID]) {
    window.nodeWork.nodes[message.nodeID].properties[message.prop] = message.properties;
  }
};

window.order.updatePos = (msg) => {
  if (window.nodeWork.nodes[msg.nodeID] && msg.pos) {
    window.nodeWork.nodes[msg.nodeID].pos = msg.pos;
  }
};

window.order.setSettings = (msg) => {
  window.settings = msg;
};

window.order.nodeMoved = (msg) => {
  if (msg.nodeID == null) return;
  if (window.nodeWork.nodes[msg.nodeID]?.widget == null) return;
  if (msg.moveTo == null) return;

  console.dlog("[nodeMoved] ", msg);
  window.nodeWork.nodes[msg.nodeID].pos = msg.moveTo;
};

window.order.moveNode = (message) => {
  if (message.moveTo) {
    window.nodeWork.nodes[message.nodeID].pos = message.moveTo;
  }
};

window.order.propUpdated = (message) => {
  window.nodeWork.nodes[message.nodeID].properties[message.prop.name] = message.prop;
  window.updateEditDialog();
};

window.order.disconnect = () => {
  console.dlog("Disconnected from the server!");
};

window.order.updateWiFi = (msg) => {
  window.wifiList = msg.updateWiFi.list.filter((value, index) => {
    return msg.updateWiFi.list.indexOf(value) === index;
  });
  window.wifiListArrived(window.wifiList);
};

window.order.connectionSettings = (msg) => {
  window.setWiFiEnabled(msg.connectionSettings.STA_Enabled);
};

Object.keys(NodeWork.events).forEach((event) => {
  if (window.socketIO) {
    window.socketIO.on(event, (message) => {
      if (NodeWork[event]) NodeWork[event](window.currentNodeWork, message.data || message);
      else window.order[event](message);
    });
  }
});

window.addEventListener("load", () => {
  websocket.onopen = () => {
    console.dlog("WebSocket opened");
    window.socket = websocket;
    window.socketIO.disconnect();
    window.socket.type = "iot";
    window.sendToNodework("id");
    window.sendToNodework("getNodework");
  };

  websocket.onclose = () => {
    console.dlog("WebSocket closed");
  };

  websocket.onerror = () => {
    console.dlog("No websocket");
  };

  websocket.onmessage = (event) => {
    console.dlog("Received message from the server:", event);

    let data = JSON.parse(event.data);
    let cmdName = data[0];
    let args = data[1];
    if (window.order[cmdName]) window.order[cmdName](args);
  };
});

