const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let tables = Array(10).fill().map(() => ({ id: Date.now() + Math.random(), players: [], board: Array(6).fill().map(() => Array(7).fill(null)), currentPlayer: 'red' }));

function checkWin(board, player) {
  // Horizontaal
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 4; c++) {
      if (board[r][c] === player && board[r][c+1] === player && 
          board[r][c+2] === player && board[r][c+3] === player) {
        return true;
      }
    }
  }

  // Verticaal
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 7; c++) {
      if (board[r][c] === player && board[r+1][c] === player && 
          board[r+2][c] === player && board[r+3][c] === player) {
        return true;
      }
    }
  }

  // Diagonaal (/)
  for (let r = 3; r < 6; r++) {
    for (let c = 0; c < 4; c++) {
      if (board[r][c] === player && board[r-1][c+1] === player && 
          board[r-2][c+2] === player && board[r-3][c+3] === player) {
        return true;
      }
    }
  }

  // Diagonaal (\)
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 4; c++) {
      if (board[r][c] === player && board[r+1][c+1] === player && 
          board[r+2][c+2] === player && board[r+3][c+3] === player) {
        return true;
      }
    }
  }

  return false;
}

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('setName', (name) => {
    socket.playerName = name;
    io.emit('tablesUpdate', tables);
  });

  socket.on('joinTable', (tableIndex) => {
    if (tables[tableIndex].players.length < 2) {
      tables[tableIndex].players.push({ id: socket.id, name: socket.playerName });
      socket.join(tables[tableIndex].id);
      io.to(tables[tableIndex].id).emit('joinedTable', tables[tableIndex]);
      io.emit('tablesUpdate', tables);
    }
  });

  socket.on('makeMove', (tableId, col) => {
    const table = tables.find(t => t.id === tableId);
    if (table) {
      const row = table.board.findIndex(row => row[col] === null);
      if (row !== -1) {
        table.board[row][col] = table.currentPlayer;
        if (checkWin(table.board, table.currentPlayer)) {
          table.scores = table.scores || { red: 0, yellow: 0 };
          table.scores[table.currentPlayer]++;
          io.to(table.id).emit('gameOver', table.currentPlayer, table.scores);
        } else if (table.board.every(row => row.every(cell => cell !== null))) {
          io.to(table.id).emit('gameOver', null, table.scores);
        } else {
          table.currentPlayer = table.currentPlayer === 'red' ? 'yellow' : 'red';
          io.to(table.id).emit('gameUpdate', table.board, table.currentPlayer);
        }
      }
    }
  });

  socket.on('playAgain', (tableId, choice) => {
    const table = tables.find(t => t.id === tableId);
    if (table) {
      if (choice) {
        table.board = Array(6).fill().map(() => Array(7).fill(null));
        table.currentPlayer = 'red';
        io.to(table.id).emit('gameUpdate', table.board, table.currentPlayer);
      } else {
        table.players = table.players.filter(p => p.id !== socket.id);
        socket.leave(table.id);
        if (table.players.length === 0) {
          table.scores = { red: 0, yellow: 0 };
        }
        io.to(table.id).emit('joinedTable', table);
        io.emit('tablesUpdate', tables);
      }
    }
  });

  socket.on('disconnect', () => {
    tables.forEach(table => {
      table.players = table.players.filter(p => p.id !== socket.id);
      if (table.players.length === 1) {
        io.to(table.id).emit('joinedTable', table);
      }
    });
    io.emit('tablesUpdate', tables);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
