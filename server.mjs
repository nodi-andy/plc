import express from "express";
import http from "http";
import { Server as socketIOServer } from "socket.io";
import { v4 as uuidv4 } from "uuid";

import NodeWork from "./public/nodework.mjs";
import { nodeList } from "./public/node_list.mjs";
import MapGenerator from "./public/mapGeneratorJS/mapGenerator.js";
import { globalApp } from "./public/enums.mjs";

const app = express();
const server = http.createServer(app);
const debug = false;

console.dlog = (...args) => {
  if (debug) console.log(...args);
};

// Combined rooms structure to manage all room data and nodes
const rooms = {};
globalApp.rooms = rooms;

const io = new socketIOServer(server, {
  cors: {
    origin: "*",
  },
});

async function loadNodes(nodes) {
  await Promise.all(nodes.map(nodePath => import("./public/" + nodePath)));
  console.log("All nodes have been loaded.");
}

// Load nodes on server start
loadNodes(nodeList).catch(error => console.error("Failed to load nodes:", error));

// Utility function to merge objects
Object.mergeObjects = (objA, objB) => {
  const mergedObject = { ...objA };
  for (const keyA in objB) {
    mergedObject[keyA] = { ...mergedObject[keyA], ...objB[keyA] };
  }
  return mergedObject;
};

async function processNodeWork() {
  for (const roomId in rooms) {
    if (rooms[roomId].nodeContainer[0]) {
      NodeWork.run(rooms[roomId]);
    }
  }
  setTimeout(processNodeWork, 1);
}
processNodeWork();

setInterval(() => {
  for (const roomId in rooms) {
    rooms[roomId].time.tick++;
  }
}, 20);

io.on("connection", (socket) => {
  console.dlog("[newClient] ", socket.id);

  socket.on("connected", (msg) => {
    console.dlog("[connected]", msg);
  });

  socket.on("createRoom", () => {
    const roomId = uuidv4();
    rooms[roomId] = {
      nodeContainer: [],
      nodes: [],
      nodesByPos: {},
      time: { tick: 0 },
      roomId,
      engine: { name: "server" },
    };

    let nodeWork = NodeWork.clear();
    nodeWork.engine = { name: "server" };
    nodeWork.nodeID = 0;
    nodeWork.platform = "server";
    nodeWork.roomId = roomId;
    
    rooms[roomId].nodeContainer[0] = nodeWork;
    rooms[roomId].platform = "server";
    const mapGenerator = new MapGenerator(100, 100, { scale: 100, seed: 12345, min: 70, max: 100 });
    rooms[roomId].map = mapGenerator.generateMap();
    
    socket.join(roomId);
    socket.roomId = roomId;
    rooms[roomId].socketOut = io;
    io.to(socket.id).emit("createRoom", roomId);
    console.log(`Created new room with ID: ${roomId}`);
  });

  socket.on("setNodework", (msg) => {
    const roomId = msg.roomId || socket.roomId;
    if (roomId && rooms[roomId]) {
      rooms[roomId].nodeWork = msg.data;
      socket.broadcast.emit("setNodework", msg);
    }
  });

  socket.on("updateProp", (msg) => {
    console.dlog("[updateProp]");
    const roomId = msg.roomId || socket.roomId;
    if (!msg || !rooms[roomId]) return;

    if (msg.device == "nodi.box" && iot) {
      iot.emit("updateProp", msg);
    } else {
      rooms[roomId].nodeWork.updateProp(msg.nodeID, msg.prop);
      io.emit("propUpdated", msg);
    }
  });

  socket.on("updateNode", (msg) => {
    console.dlog("[updateNode] ", msg.nodeID, msg.name);
    const roomId = msg.roomId || socket.roomId;
    if (!rooms[roomId]) return;

    if (rooms[roomId].nodeWork.nodes[msg.nodeID]) {
      rooms[roomId].nodeWork.nodes[msg.nodeID].cmds.push({
        cmd: "updateNode",
        who: socket.devType,
        what: msg,
      });
    }
  });

  socket.on("updateInputs", (msg) => {
    console.dlog("[updateInputs] ", msg.data.nodeID, msg.data.properties);
    const roomId = msg.roomId || socket.roomId;
    const room = rooms[roomId];

    if (room && msg.data.nodeID != null) {
        NodeWork.cmd(room, msg);
    }
  });

  socket.on("removeNode", (msg) => {
    console.dlog("[removeNode] ", msg);
    const roomId = msg.roomId || socket.roomId;
    const room = rooms[roomId];

    if (room && msg.data.pos != null) {
      NodeWork.cmd(room, msg);
    }
  });

  socket.on("moveNodeOnGrid", (msg) => {
    console.dlog("[moveNodeOnGrid] ", msg);
    const roomId = msg.roomId || socket.roomId;
    const room = rooms[roomId];

    if (room && msg.data.nodeID != null) {
      const node = room.nodeContainer[msg.data.nodeID];
      if (node /*&& (node.owner == undefined || node.owner === socket.id)*/) {
        NodeWork.cmd(room, msg);
      }
    }
  });

  socket.on("rotateNode", (msg) => {
    console.dlog("[rotateNode] ", msg);
    const roomId = msg.roomId || socket.roomId;
    const room = rooms[roomId];

    if (room && msg.data.parentID != null) {
      const node = room.nodeContainer[msg.data.parentID];
      if (node && (node.owner == undefined || node.owner === socket.id)) {
        NodeWork.cmd(node, msg);
      }
    }
  });

  socket.on("setNodeOnGrid", (msg) => {
    console.dlog("[setNodeOnGrid] ", msg);
    const roomId = msg.roomId || socket.roomId;
    const room = rooms[roomId];

    if (room && msg.data.parentID != null) {
      const node = room.nodeContainer[msg.data.parentID];
      if (node && (node.owner == undefined || node.owner === socket.id)) {
        NodeWork.cmd(node, msg);
      }
    }
  });

  socket.on("addNode", (msg) => {
    const roomId = msg.roomId || socket.roomId;
    if (rooms[roomId]) {
      msg.owner = socket.id;
      msg.data.owner = msg.owner;
      msg.data.engine = rooms[roomId].engine;
      msg.data.roomId = roomId;
      NodeWork.addNode(rooms[roomId], msg.data);
    }
  });

  socket.on("getNode", (msg) => {
    const roomId = msg.roomId || socket.roomId;
    if (rooms[roomId]) {

      socket.join(roomId);
      socket.roomId = roomId;
      let data = {
        nodeContainer: rooms[roomId].nodeContainer,
        nodesByPos: rooms[roomId].nodesByPos,
        nodeID: 0
      }
      io.to(socket.id).emit("setNodework", {data: data});
    }
  });

  socket.on("id", (msg) => {
    if (msg == null) return;
    console.dlog("[event] ", msg.id);
    socket.devType = msg.id;
    if (socket.devType === "nodi.box" || socket.devType === "esp32mcu") {
      iot = io;
      socket.to("browser_room").emit("addIoT", socket.devType);
    }
    if (socket.devType === "browser") {
      socket.join("browser_room");
      if (iot) {
        socket.emit("addIoT", iot.devType);
      }
    }
  });

  io.to(socket.id).emit("id", "");
});

app.use(express.static("data"));
app.get("/", (req, res) => {
  res.redirect(`/${uuidv4()}`);
});

app.get("/:roomId", (req, res) => {
  res.sendFile("./public/index.html");
});

server.listen(8080, () => {
  console.log("Server listening on port 8080");
});
