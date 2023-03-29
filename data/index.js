var gateway = `ws://${window.location.hostname}/ws`;
//var gateway = `ws://192.168.1.104/ws`;
var websocket;
window.ws = websocket

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
    websocket.onopen    = onOpen;
    websocket.onclose   = onClose;
    websocket.onmessage = onMessage;
}

function onOpen(event) {
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
        window.graph._nodes_by_id[data.update.id].state = data.update.state;
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
