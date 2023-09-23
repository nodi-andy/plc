const express = require('express')

const app = express()
const server = require('http').Server(app);
const io = require('socket.io')(server, {
    cors: {
      origin: '*',
    }
  });

var nodeWorkJSON = {nodes: [], links: []};

io.on('connection', socket => {
  socket.on('clean', msg => {
    console.log("[clean]");

    nodeWorkJSON = {nodes: [], links: []};
    io.emit('clean', msg);
  });
  socket.on('setNodework', msg => {
    nodeWorkJSON = msg;
    socket.broadcast.emit('setNodework', msg);
  });

  socket.on('addNode', msg => {
    //console.log("[addNode]");
    //console.log(msg);
    msg.id = nodeWorkJSON.nodes.length;
    nodeWorkJSON.nodes[msg.id] = msg;
    io.emit('addNode', msg);
  });

  socket.on('remNode', msg => {
    //console.log("[remNode]");
    //console.log(msg);
    io.emit('remNode', msg.id);
    nodeWorkJSON.nodes[msg.id] = msg;
  });

  socket.on('updateNode', msg => {
    socket.broadcast.emit('updateNode', msg);
    Object.assign(nodeWorkJSON.nodes[msg.nodeID], msg.newData);
    //console.log(nodeWorkJSON);
  });

  socket.on('addLink', msg => {
    console.log("[addLink] ", msg.id);

    socket.broadcast.emit('addLink', msg);
    if (msg.id) {
      nodeWorkJSON.links[msg.id] = msg;
    }
  });

  socket.on('moveNode', msg => {
    socket.broadcast.emit('moveNode', msg);
    Object.assign(nodeWorkJSON.nodes[msg.nodeID], msg.newData);
  });

  socket.on('setSize', msg => {
   // console.log("[setSize]: ",msg.id, nodeWorkJSON.nodes[msg.id]);
    if (msg.id != null && nodeWorkJSON.nodes[msg.id]) {
      console.log("[setSize]: ");
      console.log(msg);
      console.log(nodeWorkJSON.nodes);
      nodeWorkJSON.nodes[msg.id].size = msg.size;
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

module.exports = server;