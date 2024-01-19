import NodeWork from "./nodework.mjs";
import NodiBoxB1 from "./nodes/nodi.box/b1.js";
import NodiBoxB2 from "./nodes/nodi.box/b2.js";
import NodiBoxB3 from "./nodes/nodi.box/b3.js";
import NodiBoxB4 from "./nodes/nodi.box/b4.js";
import NodiBoxGreen from "./nodes/nodi.box/green.js";
import NodiBoxYellow from "./nodes/nodi.box/yellow.js";
import Stepper from "./nodes/nodi.box/stepper.js";
import esp32mcuB1 from "./nodes/esp32mcu/b1.js";
import esp32mcuLED from "./nodes/esp32mcu/led.js";

const events = [
  "moveNodeOnGrid",
  "addExistingNode",
  "nodePicked",
  "updateNode",
  "updatePos",
  "id",
  "createNode",
  "nodeMoved",
  "nodeResized",
  "propUpdated",
  "removeNode",
  "clear",
  "moveNode",
  "setSettings",
  "setSize",
  "disconnect",
];
const websocket = new WebSocket(`ws://${window.location.hostname}/ws`);

var uri = window.location.hostname;
if (window.location.hostname.includes(".") == false || window.location.hostname == "127.0.0.1") uri += ":8080";
if (io) window.socketIO = io(uri);

window.order = {};

function mergeObjects(objA, objB) {
  for (let key in objB) {
    if (objA[key]) {
      for (let subKey in objB[key]) {
        objA[key][subKey] = objB[key][subKey];
      }
    } else {
      // Add the new key-value pair to objB
      objB[key] = objA[key];
    }
  }
  return objA;
}

window.sendToServer = (msg, obj) => {
  // send to server
  if (window.socket.emit && window.socket.connected == true) {
    window.socket.emit(msg, obj);
  } // send to IoT
  else if (websocket.send && websocket.readyState == 1) {
    websocket.send(JSON.stringify([msg, obj]));
  } // send back to browser

  console.log(msg);
};

// Event handler for when the connection is established
window.socketIO.on("connect", () => {
  console.log("Connected to the socketIO server!");
  window.socket = window.socketIO;
  window.socket.type = "cloud";
  window.sendToServer("id");
  window.sendToServer("getNodework");
});

window.socketIO.on("setNodework", (message) => {
  window.nodeWork.setNodework(message, false);
});

window.socketIO.on("id", () => {
  window.sendToServer("id", { id: "browser" });
});


window.order.nodePicked = (node) => {
  window.nodeWork.pickNode(node);
};

window.order.nodeRemoved = (msg) => {
  window.nodeWork.nodeRemoved(msg.nodeID);
};

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
    window.nodeWork.nodes[message.nodeID].properties = mergeObjects(
      window.nodeWork.nodes[message.nodeID].properties,
      message.newData.properties
    );
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

  console.log("[nodeMoved] ", msg);
  window.nodeWork.nodes[msg.nodeID].pos = msg.moveTo;
};

window.order.nodeResized = (msg) => {
  if (msg.nodeID == null) return;
  if (window.nodeWork.nodes[msg.nodeID] == null) return;
  if (window.nodeWork.nodes[msg.nodeID].widget == null) return;

  console.log("[nodeResized] ", msg);
  window.nodeWork.nodes[msg.nodeID].setSize(msg.size);
};

window.order.clear = () => {
  window.nodeWork.clear();
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

window.order.setSize = (message) => {
  window.nodeWork.nodes[message.nodeID].size = message.size;
};

window.order.disconnect = () => {
  console.log("Disconnected from the server!");
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

events.forEach((event) => {
  if (window.socketIO) {
    window.socketIO.on(event, (message) => {
      if (window.nodeWork[event]) window.nodeWork[event](message);
      else window.order[event](message);
    });
  }
});

window.addEventListener("load", () => {
  websocket.onopen = () => {
    console.log("WebSocket opened");
    window.socket = websocket;
    window.socketIO.disconnect();
    window.socket.type = "iot";
    window.sendToServer("id");
    window.sendToServer("getNodework");
  };

  websocket.onclose = () => {
    console.log("WebSocket closed");
  };

  websocket.onmessage = (event) => {
    console.log("Received message from the server:", event);

    let data = JSON.parse(event.data);
    let cmdName = data[0];
    let args = data[1];
    if (window.order[cmdName]) window.order[cmdName](args);
  };
});
