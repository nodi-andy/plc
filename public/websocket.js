import { LiteGraph } from "./litegraph.js";
import LGraphNode from "./node.js"
import LLink from "./link.mjs"
import NodiBoxB1 from "./nodes/nodi.box/b1.js";
import NodiBoxB2 from "./nodes/nodi.box/b2.js";
import NodiBoxB3 from "./nodes/nodi.box/b3.js";
import NodiBoxB4 from "./nodes/nodi.box/b4.js";
import NodiBoxGreen from "./nodes/nodi.box/green.js";
import NodiBoxYellow from "./nodes/nodi.box/yellow.js";
import Stepper from "./nodes/nodi.box/stepper.js";

//var gateway = `ws://${window.location.hostname}/ws`;
var websocket = null;// new WebSocket(gateway);
var uri = window.location.hostname
if (window.location.hostname.includes(".") == false) uri += ":8080";
const socket = io(uri);
window.socket = socket;

window.socket.sendToServer = (msg, obj) => {
    window.socket.emit(msg, obj);
    console.log(msg);

}

// Event handler for when the connection is established
socket.on("connect", () => {
    console.log("Connected to the server!");
    socket.sendToServer('updateMe');

    onOpen();
});

socket.on("setNodework", (message) => {
    window.graph.configure(message, false);
    //window.graph.start();
    window.canvas.dirty_canvas = true;
});

socket.on("id", (message) => {
    socket.sendToServer("id", {id: "browser"});
});

socket.on("nodeAdded", (message) => {
    let newNode = LiteGraph.createNode(message.type, message.title, message.properties);
    newNode.id = message.nodeID;
    newNode.widget.id = message.nodeID;
    newNode.type = message.type;
    newNode.widget.pos = message.widget.pos;
    newNode.widget.setSize(message.widget.size);
    window.graph.add(newNode);
    window.canvas.dirty_canvas = true;
});

socket.on("addLink", (msg) => {
    window.graph._nodes_by_id[msg.from].connect(msg.fromSlot, msg.to, msg.toSlot, msg.id);
    window.canvas.dirty_canvas = true;
});

socket.on("addIoT", (msg) => {
    LiteGraph.registerNodeType("nodi.box/b1", NodiBoxB1);
    LiteGraph.registerNodeType("nodi.box/b2", NodiBoxB2);
    LiteGraph.registerNodeType("nodi.box/b3", NodiBoxB3);
    LiteGraph.registerNodeType("nodi.box/b4", NodiBoxB4);
    LiteGraph.registerNodeType("nodi.box/green_led", NodiBoxGreen);
    LiteGraph.registerNodeType("nodi.box/yellow_led", NodiBoxYellow);
    LiteGraph.registerNodeType("nodi.box/stepper", Stepper);

    window.updateNodeList();
});

socket.on("remLink", (msg) => {
    window.graph.removeLink(msg.id);
    window.canvas.dirty_canvas = true;
});

socket.on("remNode", (message) => {
    window.graph.removeNodeByID(message);
    window.canvas.dirty_canvas = true;

});

socket.on("clear", (message) => {
    window.graph.clear();
    window.canvas.dirty_canvas = true;
});

socket.on("moveNode", (message) => {
    // Handle incoming messages here
    Object.assign(window.graph._nodes_by_id[message.nodeID].widget, message.moveTo);
    window.canvas.dirty_canvas = true;
});

socket.on("setSize", (message) => {
    // Handle incoming messages here
    window.graph._nodes_by_id[message.id].widget.setSize(message.size, false);
    window.canvas.dirty_canvas = true;
});

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

socket.on("updateNode", (message) => {
    // Handle incoming messages here
    if (window.graph._nodes_by_id[message.nodeID]) {
        window.graph._nodes_by_id[message.nodeID].properties = mergeObjects(window.graph._nodes_by_id[message.nodeID].properties, message.newData.properties);
    }
    window.canvas.dirty_canvas = true;
    window.canvas.dirty_bgcanvas = true;
});

// Event handler for custom events from the server
socket.on("custom-event-from-server", (data) => {
    console.log("Received data from the server:", data);
});
socket.on("nodi.box", (data) => {
    console.log("nodi.box:", data);
});

socket.on("disconnect", () => {
    console.log("Disconnected from the server!");
});

// ----------------------------------------------------------------------------
// Initialization
// ----------------------------------------------------------------------------

window.addEventListener('load', onLoad);

function onLoad(event) {
    initWebSocket();
    initButton();
}

// ----------------------------------------------------------------------------
// WebSocket handling
// ----------------------------------------------------------------------------

function initWebSocket() {
    console.log('Trying to open a WebSocket connection...');
    window.ws = websocket
    //websocket.onopen    = onOpen;
    //websocket.onclose   = onClose;
    //websocket.onmessage = onMessage;
}

function onOpen(event) {

    console.log('Connection opened');
}

function onClose(event) {
    console.log('Connection closed');
    setTimeout(initWebSocket, 2000);
}

function onMessage(event) {
    console.log("Received message from the server:", event);

    let data = JSON.parse(event.data);
    if (data.save) {
      window.graph.configure(data.save, false);
      window.graph.start();
    }

    if (data.update) {
        if (window.graph._nodes_by_id[data.update.id].hwSetState) {
            window.graph._nodes_by_id[data.update.id].hwSetState(data.update.state);
        }
        window.graph._nodes_by_id[data.update.id].properties.value.value = data.update.value;
        window.graph._nodes_by_id[data.update.id].properties.state.value = data.update.state;
    }

    if (data.updateWiFi) {
        window.wifiList = data.updateWiFi.list.filter((value, index) => {
            return data.updateWiFi.list.indexOf(value) === index;
        });
        window.wifiListArrived(window.wifiList);
    }
    if (data.connectionSettings) {
        window.setWiFiEnabled(data.connectionSettings.STA_Enabled)
    }
    //document.getElementById('led').className = data.status;
}

/*websocket.sendMsg = (msg) => {
    websocket.send(msg);   
}*/

// ----------------------------------------------------------------------------
// Button handling
// ----------------------------------------------------------------------------

function initButton() {
    //document.getElementById('toggle').addEventListener('click', onToggle);
}

function onToggle(event) {
   // if (websocket) websocket.sendMsg(JSON.stringify({'action':'toggle'}));
}

function saveMap(event) {
    //if (websocket) socket.sendMsg(JSON.stringify({'save':window.graph.serialize()}));
}