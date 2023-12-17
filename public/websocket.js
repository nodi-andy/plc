import { LiteGraph } from "./litegraph.js";
import NodiBoxB1 from "./nodes/nodi.box/b1.js";
import NodiBoxB2 from "./nodes/nodi.box/b2.js";
import NodiBoxB3 from "./nodes/nodi.box/b3.js";
import NodiBoxB4 from "./nodes/nodi.box/b4.js";
import NodiBoxGreen from "./nodes/nodi.box/green.js";
import NodiBoxYellow from "./nodes/nodi.box/yellow.js";
import Stepper from "./nodes/nodi.box/stepper.js";
import esp32mcuB1 from "./nodes/esp32mcu/b1.js";
import esp32mcuLED from "./nodes/esp32mcu/led.js";

const events = ["nodeAdded", "updateNode", "id", "linkAdded", "linkRemoved", "nodeRemoved", "nodeMoved"];
const websocket = new WebSocket(`ws://${window.location.hostname}/ws`);

var uri = window.location.hostname;
if (window.location.hostname.includes(".") == false || window.location.hostname == "127.0.0.1") uri += ":8080";
if (io) window.socketIO = io(uri);

window.order = {}

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
}

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
    window.sendToServer("id", {id: "browser"});
});

window.order.nodeAdded = (message) => {
    let newNode = LiteGraph.createNode(message.type, message.title, message.properties);
    newNode.id = message.nodeID;
    newNode.widget.id = message.nodeID;
    newNode.type = message.type;
    newNode.widget.pos = message.widget.pos;
    newNode.widget.setSize(message.widget.size);
    window.graph.add(newNode);
    window.canvas.dirty_canvas = true;
}

window.order.nodeRemoved = (msg) => {
    window.graph.removeNodeByID(msg.id);
    window.canvas.dirty_canvas = true;
}

window.order.id = (message) => {
    if (message.id == "nodi.box") {
        LiteGraph.registerNodeType("nodi.box/b1", NodiBoxB1);
        LiteGraph.registerNodeType("nodi.box/b2", NodiBoxB2);
        LiteGraph.registerNodeType("nodi.box/b3", NodiBoxB3);
        LiteGraph.registerNodeType("nodi.box/b4", NodiBoxB4);
        LiteGraph.registerNodeType("nodi.box/green_led", NodiBoxGreen);
        LiteGraph.registerNodeType("nodi.box/yellow_led", NodiBoxYellow);
        LiteGraph.registerNodeType("nodi.box/stepper", Stepper);
    } else if (message.id == "esp32mcu") {
        LiteGraph.registerNodeType("esp32mcu/b1", esp32mcuB1);
        LiteGraph.registerNodeType("esp32mcu/led", esp32mcuLED);
    }
    window.updateNodeList();
}

window.order.updateNode = (message) => {
    // Handle incoming messages here
    if (window.graph._nodes_by_id[message.nodeID]) {
        window.graph._nodes_by_id[message.nodeID].properties = mergeObjects(window.graph._nodes_by_id[message.nodeID].properties, message.newData.properties);
    }
    window.canvas.dirty_canvas = true;
    window.canvas.dirty_bgcanvas = true;
}

window.order.linkAdded = (msg) => {
    window.graph._nodes_by_id[msg.from].connect(msg.fromSlot, msg.to, msg.toSlot, msg.nodeID);
    window.canvas.dirty_canvas = true;
}

window.order.linkRemoved = (msg) => {
    window.graph.removeLink(msg.id);
    window.canvas.dirty_canvas = true;
}

window.order.setNodework = (msg) => {
    window.graph.configure(msg, false);
    window.graph.start();
}

window.order.nodeMoved = (msg) => {
    if (msg.nodeID == null) return;
    if (window.graph._nodes_by_id[msg.nodeID] == null) return;
    if (window.graph._nodes_by_id[msg.nodeID].widget == null) return;
    
    console.log("[movedNode] ", msg);
    window.graph._nodes_by_id[msg.nodeID].widget.pos = msg.newData.pos;
};

events.forEach(event => {
    if (window.socketIO) {
        window.socketIO.on(event, message => {
            window.order[event](message);
        });
    }
});

window.socketIO.on("addLink", (msg) => {
    window.graph._nodes_by_id[msg.from].connect(msg.fromSlot, msg.to, msg.toSlot, msg.nodeID);
    window.canvas.dirty_canvas = true;
});

window.socketIO.on("remLink", (msg) => {
    window.graph.removeLink(msg.nodeID);
    window.canvas.dirty_canvas = true;
});

window.socketIO.on("remNode", (message) => {
    window.graph.removeNodeByID(message);
    window.canvas.dirty_canvas = true;

});

window.socketIO.on("clear", () => {
    window.graph.clear();
    window.canvas.dirty_canvas = true;
});

window.socketIO.on("moveNode", (message) => {
    // Handle incoming messages here
    Object.assign(window.graph._nodes_by_id[message.nodeID].widget, message.moveTo);
    window.canvas.dirty_canvas = true;
});

window.socketIO.on("setSize", (message) => {
    // Handle incoming messages here
    window.graph._nodes_by_id[message.nodeID].widget.setSize(message.size, false);
    window.canvas.dirty_canvas = true;
});

window.socketIO.on("disconnect", () => {
    console.log("Disconnected from the server!");
});

window.addEventListener('load', () => {
    websocket.onopen = () => {
        console.log('WebSocket opened');
        window.socket = websocket;
        window.socketIO.disconnect();
        window.socket.type = "iot";
        window.sendToServer("id");
        window.sendToServer("getNodework");
        window.sendToServer('updateMe', window.nodeworkID);
     }
    websocket.onclose = () => {
        console.log('WebSocket closed');
    };

    websocket.onmessage = (event) => {
        console.log("Received message from the server:", event);
    
        let data = JSON.parse(event.data);
        let cmdName = data[0];
        let args = data[1];
        if (window.order[cmdName]) window.order[cmdName](args);
    
        if (data.updateWiFi) {
            window.wifiList = data.updateWiFi.list.filter((value, index) => {
                return data.updateWiFi.list.indexOf(value) === index;
            });
            window.wifiListArrived(window.wifiList);
        }
        if (data.connectionSettings) {
            window.setWiFiEnabled(data.connectionSettings.STA_Enabled)
        }
    };
});