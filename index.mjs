import express from "express";
import http from "http";
import { Server as socketIOServer } from "socket.io";
import { NodiEnums } from "./public/enums.mjs";

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
import "./public/nodes/math/isequal.mjs";
import "./public/nodes/math/isless_core.mjs";
import "./public/nodes/math/isgreater_core.mjs";
import "./public/nodes/time/interval.mjs";
import "./public/nodes/basic/inserter.mjs";
import Vector2 from "./public/vector2.mjs";

const app = express();
const server = http.createServer(app);
global.io = new socketIOServer(server, {
  cors: {
    origin: "*",
  },
});

var nodeWorkJSON = new NodeWork();
global.iot = null;
var settings = { ownerShip: false };

setInterval(() => {
  try {
    nodeWorkJSON.nodes.forEach((node) => {
      if (!node) return;
      let curType = NodeWork.getNodeType(node.type);
      if (node.movingTo) {
        let curPos = new Vector2(node.pos[0], node.pos[1]);
        let target = new Vector2(node.movingTo[0], node.movingTo[1]);
        let moveVector = new Vector2(node.movingTo[0] - node.pos[0], node.movingTo[1] - node.pos[1])
          .normalize()
          .multiplyScalar(5);
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
          let updateData = command.what.properties;
          for(let newProp of Object.keys(updateData)) {
              for(let newVal of Object.keys(updateData[newProp])) {
                node.properties[newProp][newVal]["user"] = {val: updateData[newProp][newVal], update: true};
              }
          }
        }

        if (node.device == "nodi.box") {
          if (node.cmds[0].who != "nodi.box") {
            iot.emit("updateNode", { nodeID: node.nodeID, properties: node.properties });
          } else {
            io.emit("updateNode", { nodeID: node.nodeID, properties: node.properties });
          }
        }
      }
      if (node.device == "server") {
        //console.log(c)
        let runResults = curType?.run && curType.run(node, nodeWorkJSON);
        if (runResults.length) {
          runResults.forEach((propName) => {
            io.emit("updateNode", { nodeID: node.nodeID, prop: propName, properties: nodeWorkJSON.nodes[node.nodeID].properties[propName] });
          });
        }
      }
    });
    nodeWorkJSON.cleanUpOutputs.forEach((cleanUp) => {
      let node = nodeWorkJSON.nodes[cleanUp[0]];
      if (!node) return;
      let prop = node.properties[cleanUp[1]];
      if (!prop) return;
      prop.outValue = null;
      nodeWorkJSON.cleanUpOutputs = [];
    });
  } catch (e) {
    console.log(e);
  }
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

  NodeWork.events.forEach((event) => {
    socket.on(event, (message) => {
      if (nodeWorkJSON[event]) nodeWorkJSON[event](message, socket);
    });
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
