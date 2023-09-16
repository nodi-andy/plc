import { LiteGraph } from "./litegraph.js";
import LGraphNode from "./node.js"
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
if (window.location.hostname == "localhost") uri += ":8080";
const socket = io(uri);
window.socket = socket;

// Event handler for when the connection is established
socket.on("connect", () => {
    console.log("Connected to the server!");
    socket.emit('updateMe');

    onOpen();
});

socket.on("setNodework", (message) => {
    // Handle incoming messages here
    window.graph.configure(message, false);
    window.graph.start();
});

socket.on("addNode", (message) => {
    // Handle incoming messages here
    let newNode = LiteGraph.createNode(message.type, message.title, message.properties);
    newNode.configure(message);
    window.graph.add(newNode);
});

socket.on("updateNode", (message) => {
    // Handle incoming messages here
    Object.assign(window.graph._nodes_by_id[message.nodeID], message.newData);
    window.canvas.dirty_canvas = true;
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
    LiteGraph.registerNodeType("nodi.box/b1", NodiBoxB1);
    LiteGraph.registerNodeType("nodi.box/b2", NodiBoxB2);
    LiteGraph.registerNodeType("nodi.box/b3", NodiBoxB3);
    LiteGraph.registerNodeType("nodi.box/b4", NodiBoxB4);
    LiteGraph.registerNodeType("nodi.box/green_led", NodiBoxGreen);
    LiteGraph.registerNodeType("nodi.box/yellow_led", NodiBoxYellow);
    LiteGraph.registerNodeType("nodi.box/stepper", Stepper);

    window.updateNodeList();
    window.showBurn(true);
    console.log('Connection opened');
}

function onClose(event) {
    console.log('Connection closed');
    if (window.showBurn) window.showBurn(false);
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