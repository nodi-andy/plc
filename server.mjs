import express from "express";
import http from "http";
import { Server as socketIOServer } from "socket.io";
import { v4 as uuidv4 } from "uuid"; // To generate random UUIDs

import NodeWork from "./public/nodework.mjs";
import Node from "./public/node.mjs";
import { nodeList } from "./public/node_list.mjs";
import { globalApp } from "./public/enums.mjs";

// Function to dynamically load modules
async function loadNodes(nodes) {
  await Promise.all(nodes.map(nodePath => import("./public/" + nodePath)));
  console.log("All nodes have been loaded.");
}

// Load the nodes when the server starts
loadNodes(nodeList).catch(error => console.error("Failed to load nodes:", error));


const app = express();
const server = http.createServer(app);

var io = new socketIOServer(server, {
  cors: {
    origin: "*",
  },
});

const nodeWorkMap = {};
globalApp.data = {}
globalApp.data.engine = {name: "socketIO"};
globalApp.data.nodeContainer = [];
globalApp.data.time = {tick: 0};

var iot = null;
var settings = { ownerShip: false };

setInterval(() => {
  // Loop through each nodeWork instance in the nodeWorkMap
  for (const roomId in nodeWorkMap) {
    if (nodeWorkMap[roomId]) {
      const nodeWorkJSON = nodeWorkMap[roomId];
      NodeWork.run(nodeWorkJSON);
    }
  }
  globalApp.data.time.tick++;
}, 20);

Object.mergeObjects = (objA, objB) => {
  const mergedObject = { ...objA };

  for (const keyA in objB) {
    for (const keyB in objB[keyA]) {
      if (mergedObject[keyA] == null) mergedObject[keyA] = {};
      mergedObject[keyA][keyB] = objB[keyA][keyB];
    }
  }

  return mergedObject;
};

io.on("connection", (socket) => {
  /*Object.keys(nodeWorkJSON.events).forEach((event) => {
    socket.on(event, (message) => {
      if (nodeWorkJSON[event]) nodeWorkJSON[event](message, socket);
    });
  });*/


  socket.on("connected", (msg) => {
    console.log("[connected]", msg);
  });

  socket.on("setNodework", (msg) => {
    if (socket.devType == "nodi.box") {
      // tbd nodi.box
    } else {
      nodeWorkJSON = msg.data;
      socket.broadcast.emit("setNodework", msg);
    }
  });

  socket.on("updateProp", (msg) => {
    console.log("[updateProp]");
    //console.log(msg);
    if (!msg) return;

    if (msg.device == "nodi.box" && iot) {
      iot.emit("updateProp", msg);
    } else {
      nodeWorkJSON.updateProp(msg.nodeID, msg.prop);
      io.emit("propUpdated", msg);
    }
  });

  socket.on("updateNode", (msg) => {
    console.log("[updateNode] ", msg.nodeID, msg.name);

    //socket.broadcast.emit('updateNode', msg);
    if (msg.nodeID == null) return;
    if (nodeWorkJSON.nodes[msg.nodeID] == null) return;
    if (nodeWorkJSON.nodes[msg.nodeID].cmds == undefined) nodeWorkJSON.nodes[msg.nodeID].cmds = [];

    nodeWorkJSON.nodes[msg.nodeID].cmds.push({ cmd: "updateNode", who: socket.devType, what: msg });
    //console.log(nodeWorkJSON);
  });

  socket.on("updateInputs", (msg) => {
    console.log("[updateInputs] ", msg.data.nodeID, msg.data.properties.value);
    let roomId = msg.roomId || socket.roomId; // Use roomId from message or socket
    const nodeWorkJSON = nodeWorkMap[roomId];

    if (msg.data.nodeID == null) return;
    if (globalApp.data.nodeContainer[msg.data.nodeID] == null) return;
    let prop = Object.keys(msg.data.properties)[0];
    Node.updateInputs(globalApp.data.nodeContainer[msg.data.nodeID], prop, msg.data.properties[prop].inpValue);
    //console.log(nodeWorkJSON);
  });

  socket.on("moveNode", (msg) => {
    console.log("[moveNode] ", msg);
    let node = nodeWorkJSON.nodes[msg.nodeID];
    if (!node) return;
    if (settings.ownerShip && node.owner != socket.id) return;
    node.pos = msg.moveTo;
    node.moving = true;
    socket.to("browser_room").emit("moveNode", msg);
  });


  socket.on("id", (msg) => {
    if (msg == null) return;
    console.log("[event] ", msg.id);
    socket.devType = msg.id;
    if (socket.devType == "nodi.box" || socket.devType == "esp32mcu") {
      iot = io;
      socket.to("browser_room").emit("addIoT", socket.devType);
    }
    if (socket.devType == "browser") {
      socket.join("browser_room");
      if (iot) {
        socket.emit("addIoT", iot.devType);
      }
    }
  });

  socket.on("addNode", (msg) => {
      let roomId = msg.roomId || socket.roomId; // Use roomId from message or socket
      if (roomId || nodeWorkMap[roomId]) {
        msg.owner = socket?.id;
        msg.data.owner = msg.owner;
        msg.data.platform = "socketIO";
        msg.data.engine = nodeWorkMap[roomId].engine;
        NodeWork.addNode(nodeWorkMap[roomId], msg.data);
        delete msg.data.node;
        io.to(roomId).emit("addNode", msg);
      }
    }
  )
  socket.on("gid", (msg) => {
    let roomId = uuidv4();
    let newNode = {};
    NodeWork.clear(newNode);
    newNode.nodeID = NodeWork.getFirstNullIndex(globalApp.data.nodeContainer);
    globalApp.data.nodeContainer[newNode.nodeID] = newNode;
    nodeWorkMap[roomId] = newNode;
    newNode.platform = "socketIO";
    io.to(socket.id).emit("gid", roomId);
  });

  socket.on("getNode", (msg) => {
    let roomId = msg.roomId || socket.roomId; // Use roomId from message or socket
    
    let nodeWorkJSON = nodeWorkMap[roomId]; // Fetch the nodeWorkJSON for the room
    if(!nodeWorkJSON) {
      nodeWorkJSON = {};
      NodeWork.clear(nodeWorkJSON);
      nodeWorkJSON.nodeID = NodeWork.getFirstNullIndex(globalApp.nodeContainer);
      globalApp.data.nodeContainer[nodeWorkJSON.nodeID] = nodeWorkJSON;
      nodeWorkMap[roomId] = nodeWorkJSON;
      nodeWorkJSON.roomId = roomId;
      nodeWorkJSON.engine = {name: "socketIO"};
      console.log(`Created new room with ID: ${roomId}`);
    }
  
    // Ensure the socket is associated with the correct room
    socket.join(roomId);
    socket.roomId = roomId; // Store the roomId in the socket
  
    // Send the nodeWorkJSON and roomId back to the client
    nodeWorkJSON.socketOut = (...args) => io.to(roomId).emit(...args);
    io.to(socket.id).emit("setNodelist", globalApp.data.nodeContainer);
    io.to(socket.id).emit("setNodework", nodeWorkJSON);
  });


  io.to(socket.id).emit("id", "");
  //io.to(socket.id).emit("setSettings", settings);
  console.log("[newClient] ", socket.id);
});

app.use(express.static("data"));
app.get("/", (req, res) => {
  res.redirect(`/${uuidv4()}`); // Redirect to a new room with a random ID
});

app.get("/:roomId", (req, res) => {
  res.sendFile("./public/index.html");
});

server.listen(8080);
