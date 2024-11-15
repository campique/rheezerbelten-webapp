const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;

let tables = Array(10).fill().map((_, i) => ({
  id: `table-${i}`,
  players: [],
  board: Array(6).fill().map(() => Array(7).fill('')),
  currentPlayer: '',
  rematchVotes: { red: null, yellow: null }
}));

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('setName', (name) => {
    socket.playerName = name;
    socket.emit('tablesUpdate', tables);
  });

  socket.on('joinTable', (tableIndex) => {
    const table = tables[tableIndex];
    if (table.players.length < 2) {
      const color = table.players.length === 0 ? 'red' : 'yellow';
      table.players.push({ id: socket.id, name: socket.playerName, color });
      socket.join(table.id);
      socket.tableId = table.id;
      socket.emit('playerColor', color);

      if (table.players.length === 2) {
        startGame(table);
      }

      io.to(table.id).emit('joinedTable', table);
      io.emit('tablesUpdate', tables);
    }
  });

  socket.on('leaveTable', (tableId) => {
    leaveTable(socket);
  });

  socket.on('makeMove', (tableId, col) => {
    const table = tables.find(t => t.id === tableId);
    if (table && table.currentPlayer === getPlayerColor(socket.id, table)) {
      const row = getLowestEmptyRow(table.board, col);
      if (row !== -1) {
        table.board[row][col] = table.currentPlayer;
        const winningLine = checkWin(table.board, row, col);
        if (winningLine) {
          io.to(table.id).emit('gameOver', table.currentPlayer, winningLine);
        } else if (isBoardFull(table.board)) {
          io.to(table.id).emit('gameOver', 'draw');
        } else {
          table.currentPlayer = table.currentPlayer === 'red' ? 'yellow' : 'red';
          io.to(table.id).emit('gameUpdate', table.board, table.currentPlayer);
        }
      }
    }
  });

  socket.on('rematchVote', (tableId, color, vote) => {
    const table = tables.find(t => t.id === tableId);
    if (table) {
      table.rematchVotes[color] = vote;
      io.to(table.id).emit('rematchVoteUpdate', table.rematchVotes);
      if (table.rematchVotes.red === true && table.rematchVotes.yellow === true) {
        resetTable(table);
        startGame(table);
        io.to(table.id).emit('rematchAccepted');
      }
    }
  });

  socket.on('returnToLobby', () => {
    leaveTable(socket);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
    leaveTable(socket);
  });
});

function leaveTable(socket) {
  const table = tables.find(t => t.players.some(p => p.id === socket.id));
  if (table) {
    table.players = table.players.filter(p => p.id !== socket.id);
    socket.leave(table.id);
    if (table.players.length === 0) {
      resetTable(table);
    } else {
      io.to(table.id).emit('playerLeft', socket.id);
    }
    io.emit('tablesUpdate', tables);
  }
}

function startGame(table) {
  table.currentPlayer = Math.random() < 0.5 ? 'red' : 'yellow';
  const players = {
    red: table.players.find(p => p.color === 'red').name,
    yellow: table.players.find(p => p.color === 'yellow').name
  };
  io.to(table.id).emit('gameStart', { startingPlayer: table.currentPlayer, players });
}

function resetTable(table) {
  table.board = Array(6).fill().map(() => Array(7).fill(''));
  table.currentPlayer = '';
  table.rematchVotes = { red: null, yellow: null };
}

function getPlayerColor(playerId, table) {
  const player = table.players.find(p => p.id === playerId);
  return player ? player.color : null;
}

function getLowestEmptyRow(board, col) {
  for (let row = 5; row >= 0; row--) {
    if (board[row][col] === '') {
      return row;
    }
  }
  return -1;
}

function checkWin(board, row, col) {
  const directions = [
    [0, 1],  // horizontal
    [1, 0],  // vertical
    [1, 1],  // diagonal /
    [1, -1]  // diagonal \
  ];

  for (let [dx, dy] of directions) {
    let line = [];
    for (let i = -3; i <= 3; i++) {
      const newRow = row + i * dx;
      const newCol = col + i * dy;
      if (newRow >= 0 && newRow < 6 && newCol >= 0 && newCol < 7) {
        line.push([newRow, newCol]);
        if (line.length >= 4 && line.every(([r, c]) => board[r][c] === board[row][col])) {
          return line;
        }
      }
    }
  }
  return null;
}

function isBoardFull(board) {
  return board.every(row => row.every(cell => cell !== ''));
}

http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
