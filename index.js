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
    socket.broadcast.emit('clean', msg);
  });
  socket.on('setNodework', msg => {
    nodeWorkJSON = msg;
    socket.broadcast.emit('setNodework', msg);
  });

  socket.on('addNode', msg => {
    console.log("[addNode]");
    console.log(msg);
    socket.broadcast.emit('addNode', msg);
    nodeWorkJSON.nodes[msg.id] = msg;
  });

  socket.on('remNode', msg => {
    console.log(msg);
    socket.broadcast.emit('remNode', msg);
    nodeWorkJSON.nodes[msg.id] = msg;
    console.log("[remNode]");
    console.log(nodeWorkJSON);
  });

  socket.on('updateNode', msg => {
    socket.broadcast.emit('updateNode', msg);
    Object.assign(nodeWorkJSON.nodes[msg.nodeID], msg.newData);
    //console.log(nodeWorkJSON);
  });

  socket.on('addLink', msg => {
    socket.broadcast.emit('addLink', msg);
    if (msg.id) {
      nodeWorkJSON.links[msg.id] = msg;
    }
  });
  socket.on('moveNode', msg => {
    socket.broadcast.emit('moveNode', msg);
    Object.assign(nodeWorkJSON.nodes[msg.nodeID], msg.newData);
  });

  socket.on('remLink', msg => {
    socket.broadcast.emit('remLink', msg);
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