var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(80);

app.use(express.static('public'));

var board = {};

var ids = 0;

io.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('add piece', function (data) {
    addPiece(socket, data); 
  });

  socket.on('get id', function (data) {
    sendId(socket);
  });
  getState(socket);
});

function addPiece(socket, data) {
  console.log("adding piece: " + data);
  if (data !== undefined && data.id !== undefined
      && data.x !== undefined && data.y !== undefined) {
    console.log(data.x + ',' + data.y);
    if (board[data.x] === undefined) {
      board[data.x] = { }
    }
    board[data.x][data.y] = data;
    socket.emit('success', { success: true });
  } else {
    socket.emit('success', { success: false });
  }
}

function getState(socket) {
  socket.on('get pieces', function (data) {
    socket.emit('pieces', board);
  });
}

function sendId(socket) {
  socket.emit('send id', { id: ids });
  ids++;
}
