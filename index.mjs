import express from "express";
import http from "http";
import { Server as socketIOServer } from "socket.io";
import NodeWork from "./public/nodework.mjs";
import "./public/nodes/basic/button.mjs";
import "./public/nodes/basic/toggle.mjs";
import "./public/nodes/basic/led.mjs";
import "./public/nodes/basic/number.mjs";
import "./public/nodes/logic/and.mjs";
import "./public/nodes/logic/or_core.mjs";
import "./public/nodes/logic/xor_core.mjs";
import "./public/nodes/logic/not_core.mjs";
import "./public/nodes/math/add.mjs";
import "./public/nodes/math/mult_core.mjs";
import "./public/nodes/math/counter.mjs";
import "./public/nodes/math/isequal.mjs";
import "./public/nodes/math/isless_core.mjs";
import "./public/nodes/math/isgreater_core.mjs";
import "./public/nodes/time/interval.mjs";
import "./public/nodes/basic/inserter.mjs";
import Vector2 from "./public/vector2.mjs";

const app = express();
const server = http.createServer(app);
const io = new socketIOServer(server, {
  cors: {
    origin: "*",
  },
});

var nodeWorkJSON = new NodeWork();
var iot = null;
var settings = {ownerShip: false};

function getFirstNullIndex(arr) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] == null) {
      return i;
    }
  }
  return arr.length; // If no null item is found
}

setInterval(() => {
  try {
    nodeWorkJSON.nodes.forEach((node) => {
      if (!node) return;
      let curType = NodeWork.getNodeType(node.type);
      if (node.movingTo) {
        let curPos = new Vector2 (node.pos[0], node.pos[1]);
        let target = new Vector2(node.movingTo[0], node.movingTo[1]);
        let moveVector = new Vector2(node.movingTo[0] - node.pos[0], node.movingTo[1] - node.pos[1]).normalize().multiplyScalar(5);
        //console.log("Dist: ", curPos.distanceTo(target));
        if (curPos.distanceTo(target) > 5) {
          node.pos[0] += moveVector.x;
          node.pos[1] += moveVector.y;
        } else {
          node.pos[0] = target.x;
          node.pos[1] = target.y;
          delete node.movingTo;
        }
        
        io.emit("updatePos", { nodeID: node.nodeID, pos: node.pos });
        //console.log("JA", moveVector);
      }
      
      if (node.cmds?.length) {
        let command = node.cmds.shift();
        
        if (command.cmd == "updateNode") {
          Object.mergeObjects(node.properties, command.what);
          io.emit("updateNode", { nodeID: node.nodeID, newData: { properties: node.properties } });
        }

        if (node.device == "nodi.box") {
          if (node.cmds[0].who != "nodi.box") {
            iot.emit("updateNode", { nodeID: node.nodeID, newData: { properties: node.properties } });
          } else {
            io.emit("updateNode", { nodeID: node.nodeID, newData: { properties: node.properties } });
          }
        }
      }
      if (node.device == "server") {
        //console.log(c)
        let runResults = curType?.run && curType.run(node);
        if ( runResults == true) {
          io.emit("updateNode", { nodeID: node.nodeID, newData: { properties: node.properties } });
        }
        if ( runResults.length) {
          runResults.forEach((id) => {
            io.emit("updateNode", { nodeID: id, newData: { properties: nodeWorkJSON.nodes[id].properties } });
          }
          )
        }
      }
    });

  } catch (e) {
    console.log(e);
  }
}, 20);

Object.mergeObjects = (objA, objB) => {
  const mergedObject = { ...objA };

  for (const keyA in objB) {
    for (const keyB in objB[keyA]) {
      if (mergedObject[keyA] == null) mergedObject[keyA] = {}
      mergedObject[keyA][keyB] = objB[keyA][keyB];
    }
  }

  return mergedObject;
}

io.on("connection", (socket) => {
  socket.on("clear", (msg) => {
    console.log("[clear]");

    nodeWorkJSON = { nodes: [], nodesByPos: {} };
    io.emit("clear", msg);
  });

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

  socket.on("nodeAdded", (msg) => {
    console.log("[nodeAdded]");
    //console.log(msg);
    if (!msg) return;
    nodeWorkJSON.addNode(msg);
    io.emit("nodeAdded", msg);
  });

  socket.on("addNode", (node) => {
    console.log("[addNode]");
    //console.log(msg);
    if (!node) return;
    node.nodeID = getFirstNullIndex(nodeWorkJSON.nodes);
    node.owner = socket.id;
    node.moving = false;
    nodeWorkJSON.addNode(node);
    if (node.device == "nodi.box" && iot) {
      iot.emit("addNode", node);
    } else {
      io.emit("nodeAdded", node);
    }
  });

  socket.on("addExistingNode", (msg) => {
    console.log("[addExistingNode]");
    //console.log(msg);
    if (msg?.nodeID == null || msg?.pos == null) return;
    nodeWorkJSON.addExistingNode(msg);
    io.emit("addExistingNode", msg);
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

  socket.on("remNode", (msg) => {
    console.log("[remNode]");
    io.emit("nodeRemoved", msg);
    nodeWorkJSON.nodes[msg.nodeID] = null;
  });

  socket.on("updateNode", (msg) => {
    console.log("[updateNode] ", msg.nodeID, msg.newData.properties.state);

    //socket.broadcast.emit('updateNode', msg);
    if (msg.newData == null) return;
    if (msg.nodeID == null) return;
    if (nodeWorkJSON.nodes[msg.nodeID] == null) return;
    if (nodeWorkJSON.nodes[msg.nodeID].cmds == undefined) nodeWorkJSON.nodes[msg.nodeID].cmds = [];

    nodeWorkJSON.nodes[msg.nodeID].cmds.push({ cmd: "updateNode", who: socket.devType, what: msg.newData.properties });
    //console.log(nodeWorkJSON);
  });

  socket.on("update", (msg) => {
    console.log("[update] ", msg.nodeID, msg.newData);

    //socket.broadcast.emit('updateNode', msg);
    if (msg.newData == null) return;
    if (msg.nodeID == null) return;
    if (nodeWorkJSON.nodes[msg.nodeID] == null) return;

    for(const property in msg.newData) {
      nodeWorkJSON.nodes[msg.nodeID][property] = msg.newData[property];
    }
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

  socket.on("movingTo", (msg) => {
    console.log("[movingNode] ", msg);
    if (!(nodeWorkJSON.nodes[msg.nodeID].cmds)) nodeWorkJSON.nodes[msg.nodeID].cmds = [];
    if (settings.ownerShip && nodeWorkJSON.nodes[msg.nodeID].owner != socket.id) return;
    nodeWorkJSON.nodes[msg.nodeID].movingTo = msg.dest;
    socket.to("browser_room").emit("moveNode", msg);
  });

  socket.on("moveNodeOnGrid", (msg) => {
    if (msg.id == null) return;
    let node = nodeWorkJSON.nodes[msg.id];
    if (!node == null) return;
    if (settings.ownerShip && nodeWorkJSON.nodes[msg.id].owner != socket.id) return;

    io.emit("moveNodeOnGrid", msg);
    nodeWorkJSON.moveNodeOnGrid(msg);
  });

  socket.on("pickNode", (msg) => {
    if (msg.nodeID == null) return;
    let node = nodeWorkJSON.nodes[msg.nodeID];
    if (!node == null) return;
    if (settings.ownerShip && nodeWorkJSON.nodes[msg.nodeID].owner != socket.id) return;
    nodeWorkJSON.pickNode(msg);
    io.emit("nodePicked", msg.nodeID);
  });

  socket.on("setSize", (msg) => {
    // console.log("[setSize]: ",msg.id, nodeWorkJSON.nodes[msg.id]);
    if (msg.nodeID != null && nodeWorkJSON.nodes[msg.nodeID]) {
      console.log("[setSize]: ");
      console.log(msg.nodeID);
      nodeWorkJSON.nodes[msg.nodeID].size = msg.size;
      socket.broadcast.emit("setSize", msg);
    }
  });

  socket.on("event_name", (msg) => {
    console.log("[event] ", msg.now);
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


  socket.on("getNodework", (msg) => {
    //if (cmds == null) cmds = [];
    if (iot) {
      //iot.emit("getNodework", "");
    }
    io.to(socket.id).emit("setNodework", nodeWorkJSON);
    //console.log("[updateNewClient]");
  });
  io.to(socket.id).emit("id", "");
  io.to(socket.id).emit("setSettings", settings);
  console.log("[newClient] ", socket.id);
});
app.use(express.static("data"));
server.listen(8080);
