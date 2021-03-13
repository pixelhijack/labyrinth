const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

app.use(express.static(path.resolve(__dirname + '/public')));

let states = {}

io.on('connection', function (socket) {
    console.log('a user connected ', socket.id);
    
    socket.on('room', function (room) {
        console.log('to room ', room);
        socket.join(room);
        states[room] = {
            room: room,
            players: states[room] ? states[room].players.concat(socket.id) : [socket.id] 
        }
        io.to(room).emit('new player', states[room])
    });
    
    socket.on('disconnect', function (socket) {
        console.log('user disconnected ', socket.id);
    });
});

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.get('/:id', function (req, res) {
    //res.sendFile(__dirname + './game.html');
    res.sendFile(path.join(__dirname, 'public/game.html'));
  });

server.listen(8080, () => {
  console.log('Server listening on http://localhost:8080');
});