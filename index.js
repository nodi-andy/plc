const express = require('express')

const app = express()
const server = require('http').Server(app);
const io = require('socket.io')(server, {
    cors: {
      origin: '*',
    }
  });

  io.on('connection', socket => {
    socket.on('setNodework', msg => {
      io.emit('setNodework', msg);
    });
  });
app.use(express.static('data'));
server.listen(8080)

module.exports = server;