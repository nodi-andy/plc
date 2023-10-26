import express from 'express';
import http from 'http';
import { Server as socketIOServer } from 'socket.io';
import NodeWork from './public/nodework.mjs';
import './public/nodes/widget/button_server.mjs';
import './public/nodes/widget/toggle_server.mjs';
import './public/nodes/widget/led_server.mjs';
import './public/nodes/widget/number_server.mjs';
import './public/nodes/logic/and_core.mjs';
import './public/nodes/logic/or_core.mjs';
import './public/nodes/logic/not_core.mjs';
import './public/nodes/math/add_core.mjs';
import './public/nodes/math/mult_core.mjs';
import './public/nodes/math/counter_core.mjs';
import './public/nodes/math/isequal_core.mjs';
import './public/nodes/math/isless_core.mjs';
import './public/nodes/math/isgreater_core.mjs';
import './public/nodes/time/interval_core.mjs';
import './public/nodes/control/junction_core.mjs';

const app = express()
const server = http.createServer(app);
const io = new socketIOServer(server, {
  cors: {
    origin: '*',
  },
});


var nodeWorkJSON = new NodeWork();
var iot = null;
var cmds = [];

class UniqueIDGenerator {
  constructor() {
      this.usedIDs = new Set();
  }

  getID() {
      let id = 0;
      for(let i = 0; i < 1000; i++) {
        if (this.usedIDs.has(i)) {
          continue
        }
        id = i;
        break;
      }
      this.usedIDs.add(id);
      return id;
  }

  removeID(idToRemove) {
      if (this.usedIDs.has(idToRemove)) {
          this.usedIDs.delete(idToRemove);
      }
  }

  clear() {
    this.usedIDs.clear();
  }
}
const idGenerator = new UniqueIDGenerator();

setInterval(() => {

  // proxy
  if (cmds && cmds.length) {
    let socketID = cmds.who;
    io.to(socketID).emit(cmds.what, socketID);
    cmds.shift();
  }

  nodeWorkJSON.nodes.forEach(node => {
    let c = NodeWork.getType(node.type);
    if (node.device == "server") {
      //if (node?.properties?.state?.inpValue) console.log(node?.properties?.state?.inpValue)
      //console.log(c)
      if (node.cmds && node.cmds.length) {
        mergeObjects(node.properties, node.cmds[0])
        node.cmds.shift();
      }
      try {
        if (c && c.run && c.run(node.properties) == true) {
          io.emit('updateNode', {nodeID: node.nodeID, newData: {"properties": node.properties}});
        }
      } catch (e) {
        console.log(e);
      }
    } else if (node.device == "nodi.box") {
      if (node.cmds && node.cmds.length) {
        iot.emit('updateNode', {nodeID: node.nodeID, newData:{properties: node.cmds[0]}});
        node.cmds.shift();
      }
    }
  });

  if (nodeWorkJSON.links == null) return;

  nodeWorkJSON.links.forEach(link => {
    let dataFromNode = null;
    if (nodeWorkJSON.nodes[link.from]) {
      dataFromNode = nodeWorkJSON.nodes[link.from].properties[link.fromSlot].outValue;
    }
    if(dataFromNode !== null) {
      let toNode = nodeWorkJSON.nodes[link.to];
      if (toNode) {
        if (toNode.device == "server") {
          toNode.properties[link.toSlot].inpValue = dataFromNode;
        } else if (toNode.device == "nodi.box") {
          iot.emit('updateSlot', {nodeID:link.to, newData: {prop: link.toSlot, value: dataFromNode}});
        }
      }
    }
  });

  nodeWorkJSON.links.forEach(link => {
    nodeWorkJSON.nodes[link.from].properties[link.fromSlot].outValue = null;
  });
}, "20");

function mergeObjects(objA, objB) {
  const mergedObject = { ...objA };

  for (const keyA in objB) {
    for (const keyB in objB[keyA]) {
      mergedObject[keyA][keyB] = objB[keyA][keyB];
    }
  }

  return mergedObject;
}

io.on('connection', socket => {
  socket.on('clear', msg => {
    console.log("[clear]");

    nodeWorkJSON = {nodes: [], links: []};
    io.emit('clear', msg);
    idGenerator.clear();
  });

  socket.on('connected', msg => {
    console.log("[connected]", msg);
  });

  socket.on('setNodework', msg => {
    if (socket.devType == "nodi.box") {
      // tbd nodi.box
    } else {
      nodeWorkJSON = msg;
      socket.broadcast.emit('setNodework', msg);
    }
  });

  socket.on('nodeAdded', msg => {
    console.log("[nodeAdded]");
    //console.log(msg);
    if (!msg) return;
    nodeWorkJSON.nodes[msg.nodeID] = msg;
    io.emit('nodeAdded', msg);
  });

  socket.on('addNode', msg => {
    console.log("[addNode]");
    //console.log(msg);
    if (!msg) return;
    msg.nodeID = idGenerator.getID();
    nodeWorkJSON.nodes[msg.nodeID] = msg;
    if (msg.device == "nodi.box" && iot) {
        iot.emit('addNode', msg);
    } else {
        io.emit('nodeAdded', msg);
    }
  });

  socket.on('remNode', msg => {
    //console.log("[remNode]");
    //console.log(msg);
    io.emit('remNode', msg.id);
    idGenerator.removeID(msg.id);
    nodeWorkJSON.nodes = nodeWorkJSON.nodes.splice(msg.id, 1);
  });

  socket.on('updateNode', msg => {
    console.log("[updateNode] ", msg);

    //socket.broadcast.emit('updateNode', msg);
    if (msg.newData == null) return;
    if (msg.nodeID == null) return;
    if (nodeWorkJSON.nodes[msg.nodeID] == null) return;
    if (nodeWorkJSON.nodes[msg.nodeID].cmds == undefined) nodeWorkJSON.nodes[msg.nodeID].cmds = [];
    nodeWorkJSON.nodes[msg.nodeID].cmds.push(msg.newData.properties);
    //console.log(nodeWorkJSON);
  });

  socket.on('addLink', msg => {
    if (!msg) return;

    console.log("[addLink] ", msg);

    if (socket.devType == "browser") {
      msg.nodeID = idGenerator.getID();
      nodeWorkJSON.links[msg.nodeID] = msg;
    } else {
      if (msg.nodeID != null) {
        nodeWorkJSON.links[msg.nodeID] = msg;
      }
    }
    io.emit('addLink', msg);
  });

  socket.on('moveNode', msg => {
    console.log("[moveNode] ", msg);
    nodeWorkJSON.nodes[msg.nodeID].widget.pos = msg.moveTo.pos;
    socket.to("browser_room").emit('moveNode', msg);
  });

  socket.on('movedNode', msg => {
    if (msg.nodeID == null) return;
    if (nodeWorkJSON.nodes[msg.nodeID] == null) return;
    if (nodeWorkJSON.nodes[msg.nodeID].widget == null) return;
    
    console.log("[movedNode] ", msg);
    socket.to("browser_room").emit('moveNode', msg);
    if (iot) {
      //iot.emit("getNodework", "");
    }
    nodeWorkJSON.nodes[msg.nodeID].widget.pos = msg.newData.pos;
  });

  socket.on('setSize', msg => {
   // console.log("[setSize]: ",msg.id, nodeWorkJSON.nodes[msg.id]);
    if (msg.id != null && nodeWorkJSON.nodes[msg.id]) {
      console.log("[setSize]: ");
      console.log(msg);
      console.log(nodeWorkJSON.nodes);
      nodeWorkJSON.nodes[msg.id].widget.size = msg.size;
      socket.broadcast.emit('setSize', msg);
    }
  });

  
  socket.on('event_name', msg => {
    console.log("[event] ", msg.now);
  });

  socket.on('id', msg => {
    console.log("[event] ", msg.id);
    socket.devType = msg.id;
    if (socket.devType == "nodi.box") {
      iot = io;
      socket.to("browser_room").emit('addIoT', socket.devType);
    }
    if (socket.devType == "browser") {
      socket.join("browser_room");
      if (iot) {
        socket.emit('addIoT', iot.devType);
      }
    }
  });

  socket.on('remLink', msg => {
    console.log("[remLink] ", msg.id);
    io.emit('remLink', msg);
    nodeWorkJSON.links = nodeWorkJSON.links.filter(obj => obj.id !== msg.id);
  });

  socket.on('updateMe', () => {
    //if (cmds == null) cmds = [];
    //cmds.push({"who": socket.id, "what" : "updateMe"});
    if (iot) {
      //iot.emit("getNodework", "");
    }
    io.to(socket.id).emit("setNodework", nodeWorkJSON);
    //console.log("[updateNewClient]");
  });
  io.to(socket.id).emit("id", "");
  //console.log("[newClient]");
});
app.use(express.static('data'));
server.listen(8080)