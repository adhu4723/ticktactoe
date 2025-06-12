const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
  },
});

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

let users = {};
let board = Array(9).fill(null);
let currentPlayer = 'X';

function checkWinner(board) {
  const lines = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  for (let [a,b,c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return board.every(cell => cell !== null) ? 'draw' : null;
}

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('join-game', (username) => {
    users[socket.id] = { username, symbol: null };
    const active = Object.values(users).filter(u => u.symbol !== null).length;
    if (active < 2) {
      users[socket.id].symbol = active === 0 ? 'X' : 'O';
      socket.emit('player-assigned', users[socket.id].symbol);
      socket.emit('board-update', board);
    } else {
      socket.emit('waiting');
    }
  });

  socket.on('make-move', (index) => {
    const player = users[socket.id];
    if (player && player.symbol === currentPlayer && board[index] === null) {
      board[index] = player.symbol;
      const winner = checkWinner(board);
      if (winner) {
        io.emit('board-update', board);
        io.emit('game-over', winner);
      } else {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        io.emit('board-update', board);
      }
    }
  });

  socket.on('reset', () => {
    board = Array(9).fill(null);
    currentPlayer = 'X';
    io.emit('board-update', board);
  });

  socket.on('disconnect', () => {
    console.log('Disconnected:', socket.id);
    delete users[socket.id];
    board = Array(9).fill(null);
    currentPlayer = 'X';
    io.emit('board-update', board);
  });
});

server.listen(4000, () => console.log('Server started on port 4000'));