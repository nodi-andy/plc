import express from "express";
import http from "http";
import { Server as socketIOServer } from "socket.io";
import NodeWork from "./public/nodework.mjs";
import "./public/nodes/widget/button.mjs";
import "./public/nodes/widget/toggle.mjs";
import "./public/nodes/widget/led.mjs";
import "./public/nodes/widget/number.mjs";
import "./public/nodes/logic/and_core.mjs";
import "./public/nodes/logic/or_core.mjs";
import "./public/nodes/logic/xor_core.mjs";
import "./public/nodes/logic/not_core.mjs";
import "./public/nodes/math/add_core.mjs";
import "./public/nodes/math/mult_core.mjs";
import "./public/nodes/math/counter.mjs";
import "./public/nodes/math/isequal_core.mjs";
import "./public/nodes/math/isless_core.mjs";
import "./public/nodes/math/isgreater_core.mjs";
import "./public/nodes/time/interval.mjs";
import "./public/nodes/control/junction.mjs";

const app = express();
const server = http.createServer(app);
const io = new socketIOServer(server, {
  cors: {
    origin: "*",
  },
});

var nodeWorkJSON = new NodeWork();
var iot = null;

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
      let c = NodeWork.getNodeType(node.type);
      if (node.cmds && node.cmds.length) {
        let command = node.cmds.shift();
        
        if (command.cmd == "updateNode") {
          mergeObjects(node.properties, command.what);
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
        //if (node?.properties?.state?.inpValue) console.log(node?.properties?.state?.inpValue)
        //console.log(c)

        if (c && c.run && c.run(node.properties) == true) {
          io.emit("updateNode", { nodeID: node.nodeID, newData: { properties: node.properties } });
        }
      }
    });

    if (nodeWorkJSON.links == null) return;

    nodeWorkJSON.links.forEach((link) => {
      if (!link) return;
      let dataFromNode = null;
      if (nodeWorkJSON.nodes[link.from]) {
        dataFromNode = nodeWorkJSON.nodes[link.from].properties[link.fromSlot].outValue;
      }
      if (dataFromNode !== null) {
        let toNode = nodeWorkJSON.nodes[link.to];
        if (toNode) {
          if (toNode.device == "server") {
            toNode.properties[link.toSlot].inpValue = dataFromNode;
          } else if (toNode.device == "nodi.box") {
            iot.emit("updateSlot", { nodeID: link.to, newData: { prop: link.toSlot, value: dataFromNode } });
          }
        }
      }
    });

    nodeWorkJSON.links.forEach((link) => {
      if (!link) return;
      nodeWorkJSON.nodes[link.from].properties[link.fromSlot].outValue = null;
    });
  } catch (e) {
    console.log(e);
  }
}, "20");

function mergeObjects(objA, objB) {
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

    nodeWorkJSON = { nodes: [], links: [] };
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
    nodeWorkJSON.nodes[msg.nodeID] = msg;
    io.emit("nodeAdded", msg);
  });

  socket.on("addNode", (msg) => {
    console.log("[addNode]");
    //console.log(msg);
    if (!msg) return;
    msg.nodeID = getFirstNullIndex(nodeWorkJSON.nodes);
    nodeWorkJSON.nodes[msg.nodeID] = msg;
    if (msg.device == "nodi.box" && iot) {
      iot.emit("addNode", msg);
    } else {
      io.emit("nodeAdded", msg);
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

  socket.on("remNode", (msg) => {
    console.log("[remNode]");
    io.emit("nodeRemoved", msg);
    for (const [, nodeProp] of Object.entries(nodeWorkJSON.nodes[msg.nodeID].properties)) {
      nodeProp.links.forEach((linkID) => {
        io.emit("linkRemoved", {linkID: linkID});
        nodeWorkJSON.links[linkID] = null;
      })
    }
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

  socket.on("addLink", (msg) => {
    if (!msg) return;

    console.log("[addLink] ", msg);
    msg.linkID = getFirstNullIndex(nodeWorkJSON.links);
    nodeWorkJSON.addLink(msg);
    if (nodeWorkJSON.nodes[msg.from].links) {
      nodeWorkJSON.nodes[msg.from].links.push(msg.linkID);
    } else {
      nodeWorkJSON.nodes[msg.from].links = [msg.linkID];

    }
    io.emit("addLink", msg);
  });

  socket.on("moveNode", (msg) => {
    console.log("[moveNode] ", msg);
    nodeWorkJSON.nodes[msg.nodeID].pos = msg.moveTo;
    socket.to("browser_room").emit("moveNode", msg);
  });

  socket.on("movedNode", (msg) => {
    if (msg.nodeID == null) return;
    if (nodeWorkJSON.nodes[msg.nodeID] == null) return;

    console.log("[movedNode] ", msg);
    socket.to("browser_room").emit("moveNode", msg);
    if (iot) {
      //iot.emit("getNodework", "");
    }
    nodeWorkJSON.nodes[msg.nodeID].pos = msg.moveTo;
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

  socket.on("remLink", (msg) => {
    console.log("[remLink] ", msg.nodeID);
    nodeWorkJSON.links[msg.nodeID] = null;

    if (msg.device != "server" && iot) {
      iot.emit("remLink", msg);
    } else {
      io.emit("linkRemoved", {linkID: msg.nodeID});
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
  //console.log("[newClient]");
});
app.use(express.static("data"));
server.listen(8080);
