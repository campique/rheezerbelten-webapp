const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Hulpfuncties
const createEmptyBoard = () => Array(6).fill().map(() => Array(7).fill(''));

const checkForWin = (board, row, col, player) => {
  // Horizontaal, verticaal en diagonaal controleren
  const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
  return directions.some(([dx, dy]) => {
    let count = 1;
    for (let i = 1; i <= 3; i++) {
      const newRow = row + i * dx;
      const newCol = col + i * dy;
      if (newRow < 0 || newRow >= 6 || newCol < 0 || newCol >= 7 || board[newRow][newCol] !== player) break;
      count++;
    }
    for (let i = 1; i <= 3; i++) {
      const newRow = row - i * dx;
      const newCol = col - i * dy;
      if (newRow < 0 || newRow >= 6 || newCol < 0 || newCol >= 7 || board[newRow][newCol] !== player) break;
      count++;
    }
    return count >= 4;
  });
};

const checkForDraw = (board) => board.every(row => row.every(cell => cell !== ''));

// Spelstaat
let tables = Array(10).fill().map((_, i) => ({
  id: i,
  players: [],
  board: createEmptyBoard(),
  currentPlayer: 'red',
  gameActive: false
}));

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('enterLobby', (playerName) => {
    socket.playerName = playerName;
    socket.emit('lobbyUpdate', tables.map(table => ({
      id: table.id,
      players: table.players.length
    })));
  });

  socket.on('joinTable', (tableId) => {
    const table = tables[tableId];
    if (table && table.players.length < 2) {
      socket.tableId = tableId;
      table.players.push({
        id: socket.id,
        name: socket.playerName,
        color: table.players.length === 0 ? 'red' : 'yellow'
      });
      socket.join(`table-${tableId}`);

      if (table.players.length === 2) {
        table.gameActive = true;
        io.to(`table-${tableId}`).emit('gameStart', {
          tableId,
          board: table.board,
          currentPlayer: table.currentPlayer
        });
      }

      io.emit('lobbyUpdate', tables.map(table => ({
        id: table.id,
        players: table.players.length
      })));
    }
  });

  socket.on('makeMove', ({ tableId, column }) => {
    const table = tables[tableId];
    if (table && table.gameActive) {
      const player = table.players.find(p => p.id === socket.id);
      if (player && player.color === table.currentPlayer) {
        for (let row = 5; row >= 0; row--) {
          if (table.board[row][column] === '') {
            table.board[row][column] = player.color;
            if (checkForWin(table.board, row, column, player.color)) {
              io.to(`table-${tableId}`).emit('gameOver', { winner: player.color });
              table.gameActive = false;
            } else if (checkForDraw(table.board)) {
              io.to(`table-${tableId}`).emit('gameOver', { winner: 'draw' });
              table.gameActive = false;
            } else {
              table.currentPlayer = table.currentPlayer === 'red' ? 'yellow' : 'red';
              io.to(`table-${tableId}`).emit('gameUpdate', {
                board: table.board,
                currentPlayer: table.currentPlayer
              });
            }
            break;
          }
        }
      }
    }
  });

  socket.on('playAgainVote', ({ tableId, vote }) => {
    const table = tables[tableId];
    if (table) {
      const player = table.players.find(p => p.id === socket.id);
      if (player) {
        player.playAgainVote = vote;
        if (table.players.every(p => p.playAgainVote !== undefined)) {
          if (table.players.every(p => p.playAgainVote)) {
            // Reset the game
            table.board = createEmptyBoard();
            table.currentPlayer = 'red';
            table.gameActive = true;
            table.players.forEach(p => delete p.playAgainVote);
            io.to(`table-${tableId}`).emit('gameStart', {
              tableId,
              board: table.board,
              currentPlayer: table.currentPlayer
            });
          } else {
            // Return players to lobby
            table.players.forEach(p => {
              const playerSocket = io.sockets.sockets.get(p.id);
              if (playerSocket) {
                playerSocket.leave(`table-${tableId}`);
                playerSocket.emit('returnToLobby');
              }
            });
            table.players = [];
            table.board = createEmptyBoard();
            table.currentPlayer = 'red';
            table.gameActive = false;
            io.emit('lobbyUpdate', tables.map(table => ({
              id: table.id,
              players: table.players.length
            })));
          }
        }
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
    if (socket.tableId !== undefined) {
      const table = tables[socket.tableId];
      if (table) {
        table.players = table.players.filter(p => p.id !== socket.id);
        if (table.players.length === 0) {
          table.board = createEmptyBoard();
          table.currentPlayer = 'red';
          table.gameActive = false;
        } else if (table.gameActive) {
          io.to(`table-${socket.tableId}`).emit('returnToLobby');
          table.players = [];
          table.board = createEmptyBoard();
          table.currentPlayer = 'red';
          table.gameActive = false;
        }
        io.emit('lobbyUpdate', tables.map(table => ({
          id: table.id,
          players: table.players.length
        })));
      }
    }
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
