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
  socket.on('setNodework', msg => {
    nodeWorkJSON = msg;
    socket.broadcast.emit('setNodework', msg);
  });
  socket.on('addNode', msg => {
    socket.broadcast.emit('addNode', msg);
    nodeWorkJSON.nodes[msg.id] = msg;
    console.log("[addNode]");
  });
  socket.on('updateNode', msg => {
    socket.broadcast.emit('updateNode', msg);
    nodeWorkJSON.nodes[msg.nodeID] = msg.newData;
  });
  //io.emit('setNodework', nodeWorkJSON);
});
app.use(express.static('data'));
server.listen(8080)

module.exports = server;