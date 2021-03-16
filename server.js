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
    
    socket.on('user joined room', ({ roomId }) => {
        socket.join(roomId);
        states[roomId].players = states[roomId].players.concat(socket.id);
        console.log('user joined room', states[roomId]);
        io.to(roomId).emit('players welcome new player', states[roomId])

        socket.on('disconnect', function () {
          if(states[roomId].players.length > 1) {
            states[roomId].players = states[roomId].players.filter(p => p !== socket.id);
          } else {
            delete states[roomId];
          }
          console.log(`user ${socket.id} disconnected `, states);
        });

        [
          'player move: LEFT',
          'player move: RIGHT',
          'player move: UP',
          'player move: DOWN'
        ].forEach(gameEvent => {
          // read user input...
          socket.on(gameEvent, (args) => {
            // ...update game state
            io.to(roomId).emit(gameEvent, args)
          });
        });
    });
});

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.get('/:id', function (req, res) {
    //res.sendFile(__dirname + './game.html');
    states[req.params.id] = states[req.params.id] || {
      room: req.params.id,
      players: []
    }
    console.log('/:id', states)
    res.sendFile(path.join(__dirname, 'public/game.html'));
  });

server.listen(8080, () => {
  console.log('Server listening on http://localhost:8080');
});