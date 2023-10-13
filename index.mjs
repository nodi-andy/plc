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


setInterval(() => {
  nodeWorkJSON.nodes.forEach(node => {
    let c = NodeWork.getType(node.type);
    //if (node?.properties?.state?.inpValue) console.log(node?.properties?.state?.inpValue)
    //console.log(c)
    if (node.cmds && node.cmds.length) {
      mergeObjects(node.properties, node.cmds[0])
      node.cmds.shift();
    }
    try {
      if (c.run(node.properties) == true) {
        io.emit('updateNode', {nodeID: node.id, newData: {"properties": node.properties}});
      }
    } catch (e) {
      console.log(e);
    }
  });

  nodeWorkJSON.links.forEach(link => {
    let dataFromNode = null;
    if (nodeWorkJSON.nodes[link.from]) {
      dataFromNode = nodeWorkJSON.nodes[link.from].properties[link.fromSlot].outValue;
    }
    if(dataFromNode !== null) {
      nodeWorkJSON.nodes[link.to].properties[link.toSlot].inpValue = dataFromNode;
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
  socket.on('clean', msg => {
    console.log("[clean]");

    nodeWorkJSON = {nodes: [], links: []};
    io.emit('clean', msg);
  });

  socket.on('connected', msg => {
    console.log("[connected]");
  });
  socket.on('setNodework', msg => {
    nodeWorkJSON = msg;
    socket.broadcast.emit('setNodework', msg);
  });

  socket.on('addNode', msg => {
    //console.log("[addNode]");
    //console.log(msg);
    if (!msg) return;
    msg.id = nodeWorkJSON.nodes.length;
    nodeWorkJSON.nodes[msg.id] = msg;
    io.emit('addNode', msg);
  });

  socket.on('remNode', msg => {
    //console.log("[remNode]");
    //console.log(msg);
    io.emit('remNode', msg.id);
    nodeWorkJSON.nodes = nodeWorkJSON.nodes.splice(msg.id, 1);
  });

  socket.on('updateNode', msg => {
    socket.broadcast.emit('updateNode', msg);
    if (nodeWorkJSON.nodes[msg.nodeID] == null) return;
    if (nodeWorkJSON.nodes[msg.nodeID].cmds == undefined) nodeWorkJSON.nodes[msg.nodeID].cmds = [];
    nodeWorkJSON.nodes[msg.nodeID].cmds.push(msg.newData.properties);
    //console.log(nodeWorkJSON);
  });

  socket.on('addLink', msg => {
    console.log("[addLink] ", msg);
    msg.id = nodeWorkJSON.links.length;

    if (msg.id != null) {
      nodeWorkJSON.links[msg.id] = msg;
    }
    io.emit('addLink', msg);
  });

  socket.on('moveNode', msg => {
    socket.broadcast.emit('moveNode', msg);
    if (msg.nodeID == null) return;
    if (nodeWorkJSON.nodes[msg.nodeID] == null) return;
    if (nodeWorkJSON.nodes[msg.nodeID].widget == null) return;
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

  socket.on('remLink', msg => {
    console.log("[remLink] ", msg.id);
    io.emit('remLink', msg);
    nodeWorkJSON.links = nodeWorkJSON.links.filter(obj => obj.id !== msg.id);
  });


  socket.on('updateMe', () => {
    io.to(socket.id).emit("setNodework", nodeWorkJSON);
    console.log("[updateNewClient]");
  });
  console.log("[newClient]");

});
app.use(express.static('data'));
server.listen(8080)
