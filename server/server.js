const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let tables = Array(10).fill().map(() => ({ 
  id: Date.now() + Math.random(), 
  players: [], 
  board: Array(6).fill().map(() => Array(7).fill('')), 
  currentPlayer: '',
  rematchVotes: { red: null, yellow: null }
}));

function removePlayerFromAllTables(playerId) {
  tables.forEach(table => {
    const playerIndex = table.players.findIndex(p => p.id === playerId);
    if (playerIndex !== -1) {
      table.players.splice(playerIndex, 1);
      if (table.players.length === 0) {
        table.board = Array(6).fill().map(() => Array(7).fill(''));
        table.currentPlayer = '';
        table.rematchVotes = { red: null, yellow: null };
      }
    }
  });
}

function checkWin(board, player) {
  // Horizontaal
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 4; c++) {
      if (board[r][c] === player && board[r][c+1] === player && 
          board[r][c+2] === player && board[r][c+3] === player) {
        return [[r,c], [r,c+1], [r,c+2], [r,c+3]];
      }
    }
  }

  // Verticaal
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 7; c++) {
      if (board[r][c] === player && board[r+1][c] === player && 
          board[r+2][c] === player && board[r+3][c] === player) {
        return [[r,c], [r+1,c], [r+2,c], [r+3,c]];
      }
    }
  }

  // Diagonaal (/)
  for (let r = 3; r < 6; r++) {
    for (let c = 0; c < 4; c++) {
      if (board[r][c] === player && board[r-1][c+1] === player && 
          board[r-2][c+2] === player && board[r-3][c+3] === player) {
        return [[r,c], [r-1,c+1], [r-2,c+2], [r-3,c+3]];
      }
    }
  }

  // Diagonaal (\)
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 4; c++) {
      if (board[r][c] === player && board[r+1][c+1] === player && 
          board[r+2][c+2] === player && board[r+3][c+3] === player) {
        return [[r,c], [r+1,c+1], [r+2,c+2], [r+3,c+3]];
      }
    }
  }

  return null;
}

function checkDraw(board) {
  return board.every(row => row.every(cell => cell !== ''));
}

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('setName', (name) => {
    socket.playerName = name;
    io.emit('tablesUpdate', tables);
  });

  socket.on('joinTable', (tableIndex) => {
    removePlayerFromAllTables(socket.id);
    if (tables[tableIndex].players.length < 2) {
      const color = tables[tableIndex].players.length === 0 ? 'red' : 'yellow';
      tables[tableIndex].players.push({ id: socket.id, name: socket.playerName, color });
      socket.join(tables[tableIndex].id);
      socket.emit('playerColor', color);
      
      if (tables[tableIndex].players.length === 2) {
        const startingPlayer = Math.random() < 0.5 ? 'red' : 'yellow';
        tables[tableIndex].currentPlayer = startingPlayer;
        const players = {
          red: tables[tableIndex].players.find(p => p.color === 'red').name,
          yellow: tables[tableIndex].players.find(p => p.color === 'yellow').name
        };
        io.to(tables[tableIndex].id).emit('gameStart', { startingPlayer, players });
      }
      
      io.to(tables[tableIndex].id).emit('joinedTable', tables[tableIndex]);
      io.emit('tablesUpdate', tables);
    }
  });

  socket.on('makeMove', (tableId, col) => {
    const table = tables.find(t => t.id === tableId);
    if (table) {
      for (let row = 5; row >= 0; row--) {
        if (table.board[row][col] === '') {
          table.board[row][col] = table.currentPlayer;
          const winningLine = checkWin(table.board, table.currentPlayer);
          if (winningLine) {
            io.to(table.id).emit('gameOver', table.currentPlayer, winningLine);
          } else if (checkDraw(table.board)) {
            io.to(table.id).emit('gameOver', 'draw', null);
          } else {
            table.currentPlayer = table.currentPlayer === 'red' ? 'yellow' : 'red';
            io.to(table.id).emit('gameUpdate', table.board, table.currentPlayer);
          }
          break;
        }
      }
    }
  });

  socket.on('rematchVote', (tableId, color, vote) => {
    const table = tables.find(t => t.id === tableId);
    if (table) {
      table.rematchVotes[color] = vote;
      io.to(table.id).emit('rematchVoteUpdate', table.rematchVotes);

      if (table.rematchVotes.red === false || table.rematchVotes.yellow === false) {
        returnToLobby(table);
      } else if (table.rematchVotes.red === true && table.rematchVotes.yellow === true) {
        startNewGame(table);
      }
    }
  });

  socket.on('returnToLobby', () => {
    const table = tables.find(t => t.players.some(p => p.id === socket.id));
    if (table) {
      const otherPlayer = table.players.find(p => p.id !== socket.id);
      if (otherPlayer) {
        io.to(otherPlayer.id).emit('opponentLeft');
      }
      removePlayerFromAllTables(socket.id);
      io.emit('tablesUpdate', tables);
    }
  });

  socket.on('disconnect', () => {
    const table = tables.find(t => t.players.some(p => p.id === socket.id));
    if (table) {
      const otherPlayer = table.players.find(p => p.id !== socket.id);
      if (otherPlayer) {
        io.to(otherPlayer.id).emit('opponentLeft');
      }
    }
    removePlayerFromAllTables(socket.id);
    io.emit('tablesUpdate', tables);
  });
});

function startNewGame(table) {
  table.board = Array(6).fill().map(() => Array(7).fill(''));
  const startingPlayer = Math.random() < 0.5 ? 'red' : 'yellow';
  table.currentPlayer = startingPlayer;
  const players = {
    red: table.players.find(p => p.color === 'red').name,
    yellow: table.players.find(p => p.color === 'yellow').name
  };
  table.rematchVotes = { red: null, yellow: null };
  io.to(table.id).emit('rematchAccepted');
  io.to(table.id).emit('gameStart', { startingPlayer, players });
}

function returnToLobby(table) {
  io.to(table.id).emit('returnToLobby');
  table.players.forEach(player => {
    const playerSocket = io.sockets.sockets.get(player.id);
    if (playerSocket) {
      playerSocket.leave(table.id);
      removePlayerFromAllTables(player.id);
    }
  });
  table.players = [];
  table.board = Array(6).fill().map(() => Array(7).fill(''));
  table.currentPlayer = '';
  table.rematchVotes = { red: null, yellow: null };
  io.emit('tablesUpdate', tables);
}

app.use(express.static(path.join(__dirname, '../build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
