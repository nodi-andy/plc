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
  "nodeAdded",
  "updateNode",
  "id",
  "linkAdded",
  "linkRemoved",
  "nodeRemoved",
  "nodeMoved",
  "nodeResized",
  "addLink",
  "remLink",
  "remNode",
  "clear",
  "moveNode",
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
  window.graph.configure(message, false);
  window.canvas.dirty_canvas = true;
});

window.socketIO.on("id", () => {
  window.sendToServer("id", { id: "browser" });
});

window.order.nodeAdded = (message) => {
  let newNode = NodeWork.createNode(message.type, message.title, message.properties);
  newNode.id = message.nodeID;
  newNode.widget.id = message.nodeID;
  newNode.type = message.type;
  newNode.widget.pos = message.widget.pos;
  newNode.widget.setSize(message.widget.size);
  window.graph.add(newNode);
  window.canvas.dirty_canvas = true;
};

window.order.nodeRemoved = (msg) => {
  window.graph.removeNodeByID(msg.id);
  window.canvas.dirty_canvas = true;
};

window.order.id = (message) => {
  if (message.id == "nodi.box") {
    NodeWork.registerNodeType("nodi.box/b1", NodiBoxB1);
    NodeWork.registerNodeType("nodi.box/b2", NodiBoxB2);
    NodeWork.registerNodeType("nodi.box/b3", NodiBoxB3);
    NodeWork.registerNodeType("nodi.box/b4", NodiBoxB4);
    NodeWork.registerNodeType("nodi.box/green_led", NodiBoxGreen);
    NodeWork.registerNodeType("nodi.box/yellow_led", NodiBoxYellow);
    NodeWork.registerNodeType("nodi.box/stepper", Stepper);
  } else if (message.id == "esp32mcu") {
    NodeWork.registerNodeType("esp32mcu/b1", esp32mcuB1);
    NodeWork.registerNodeType("esp32mcu/led", esp32mcuLED);
  }
  window.updateNodeList();
};

window.order.updateNode = (message) => {
  // Handle incoming messages here
  if (window.graph.nodes[message.nodeID]) {
    window.graph.nodes[message.nodeID].properties = mergeObjects(
      window.graph.nodes[message.nodeID].properties,
      message.newData.properties
    );
  }
  window.canvas.dirty_canvas = true;
  window.canvas.dirty_bgcanvas = true;
};

window.order.linkAdded = (msg) => {
  window.graph.nodes[msg.from].connect(msg.fromSlot, msg.to, msg.toSlot, msg.nodeID);
  window.canvas.dirty_canvas = true;
};

window.order.linkRemoved = (msg) => {
  window.graph.removeLink(msg.nodeID);
  window.canvas.dirty_canvas = true;
};

window.order.setNodework = (msg) => {
  window.graph.configure(msg, false);
  window.graph.start();
};

window.order.nodeMoved = (msg) => {
  if (msg.nodeID == null) return;
  if (window.graph.nodes[msg.nodeID] == null) return;
  if (window.graph.nodes[msg.nodeID].widget == null) return;

  console.log("[movedNode] ", msg);
  window.graph.nodes[msg.nodeID].widget.pos = msg.moveTo;
};

window.order.nodeResized = (msg) => {
  if (msg.nodeID == null) return;
  if (window.graph.nodes[msg.nodeID] == null) return;
  if (window.graph.nodes[msg.nodeID].widget == null) return;

  console.log("[movedNode] ", msg);
  window.graph.nodes[msg.nodeID].setSize(msg.size);
};

window.order.addLink = (msg) => {
  window.graph.nodes[msg.from].connect(msg.fromSlot, msg.to, msg.toSlot, msg.nodeID);
  window.canvas.dirty_canvas = true;
};

window.order.remLink = (msg) => {
  window.graph.removeLink(msg.nodeID);
  window.canvas.dirty_canvas = true;
};

window.order.remNode = (message) => {
  window.graph.removeNodeByID(message);
  window.canvas.dirty_canvas = true;
};

window.order.clear = () => {
  window.graph.clear();
  window.canvas.dirty_canvas = true;
};

window.order.moveNode = (message) => {
  // Handle incoming messages here
  window.graph.nodes[message.nodeID].widget.pos = message.moveTo;
  window.canvas.dirty_canvas = true;
};

window.order.setSize = (message) => {
  // Handle incoming messages here
  window.graph.nodes[message.nodeID].widget.setSize(message.size, false);
  window.canvas.dirty_canvas = true;
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
      window.order[event](message);
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
