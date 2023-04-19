import { LiteGraph } from "./litegraph.js";
import NodiBoxB1 from "./nodes/nodi.box/b1.js";
import NodiBoxB2 from "./nodes/nodi.box/b2.js";
import NodiBoxB3 from "./nodes/nodi.box/b3.js";
import NodiBoxB4 from "./nodes/nodi.box/b4.js";
import NodiBoxRed from "./nodes/nodi.box/red.js";
import NodiBoxYellow from "./nodes/nodi.box/yellow.js";
import Stepper from "./nodes/nodi.box/stepper.js";

var gateway = `ws://${window.location.hostname}/ws`;
//var gateway = `ws://192.168.1.104/ws`;
var websocket;

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
    websocket = new WebSocket(gateway);
    window.ws = websocket
    websocket.onopen    = onOpen;
    websocket.onclose   = onClose;
    websocket.onmessage = onMessage;
}

function onOpen(event) {
    LiteGraph.registerNodeType("nodi.box/b1", NodiBoxB1);
    LiteGraph.registerNodeType("nodi.box/b2", NodiBoxB2);
    LiteGraph.registerNodeType("nodi.box/b3", NodiBoxB3);
    LiteGraph.registerNodeType("nodi.box/b4", NodiBoxB4);
    LiteGraph.registerNodeType("nodi.box/green_led", NodiBoxRed);
    LiteGraph.registerNodeType("nodi.box/yellow_led", NodiBoxYellow);
    LiteGraph.registerNodeType("nodi.box/stepper", Stepper);

    window.updateNodeList();
    window.burnClickable = true;
    console.log('Connection opened');
}

function onClose(event) {
    console.log('Connection closed');
    setTimeout(initWebSocket, 2000);
}

function onMessage(event) {
    let data = JSON.parse(event.data);
    if (data.save) {
      window.graph.configure(data.save, false);
      window.graph.start();
    }

    if (data.update) {
        window.graph._nodes_by_id[data.update.id].hwSetState(data.update.state);
        window.graph._nodes_by_id[data.update.id].value = data.update.value;
    }
    //document.getElementById('led').className = data.status;
}

// ----------------------------------------------------------------------------
// Button handling
// ----------------------------------------------------------------------------

function initButton() {
    //document.getElementById('toggle').addEventListener('click', onToggle);
}

function onToggle(event) {
    if (websocket) websocket.send(JSON.stringify({'action':'toggle'}));
}

function saveMap(event) {
    if (websocket) websocket.send(JSON.stringify({'save':window.graph.serialize()}));
}