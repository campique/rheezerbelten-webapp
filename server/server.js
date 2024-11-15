const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../build')));

let waitingPlayer = null;

io.on('connection', (socket) => {
  console.log('New client connected');

  if (waitingPlayer) {
    // Start game
    const game = {
      players: [waitingPlayer, socket],
      currentPlayer: 'red',
      gameState: Array(6).fill().map(() => Array(7).fill(''))
    };

    waitingPlayer.emit('gameStart', { color: 'red' });
    socket.emit('gameStart', { color: 'yellow' });

    waitingPlayer = null;

    game.players.forEach(player => {
      player.on('makeMove', ({ col }) => {
        if (player !== game.players[game.currentPlayer === 'red' ? 0 : 1]) return;

        const row = game.gameState.findIndex(r => r[col] === '');
        if (row === -1) return;

        game.gameState[row][col] = game.currentPlayer;
        game.currentPlayer = game.currentPlayer === 'red' ? 'yellow' : 'red';

        io.to(game.players[0].id).to(game.players[1].id).emit('gameUpdate', {
          gameState: game.gameState,
          currentPlayer: game.currentPlayer
        });

        if (checkForWin(game.gameState, row, col)) {
          io.to(game.players[0].id).to(game.players[1].id).emit('gameOver', {
            winner: game.currentPlayer === 'red' ? 'yellow' : 'red'
          });
        } else if (checkForDraw(game.gameState)) {
          io.to(game.players[0].id).to(game.players[1].id).emit('gameOver', { winner: 'draw' });
        }
      });

      player.on('resetGame', () => {
        game.gameState = Array(6).fill().map(() => Array(7).fill(''));
        game.currentPlayer = 'red';
        io.to(game.players[0].id).to(game.players[1].id).emit('gameUpdate', {
          gameState: game.gameState,
          currentPlayer: game.currentPlayer
        });
      });
    });

  } else {
    waitingPlayer = socket;
    socket.emit('waiting');
  }

  socket.on('disconnect', () => {
    console.log('Client disconnected');
    if (waitingPlayer === socket) {
      waitingPlayer = null;
    }
  });
});

function checkForWin(board, row, col) {
  const player = board[row][col];
  
  // Check horizontal
  for (let c = 0; c <= 3; c++) {
    if (board[row][c] === player && board[row][c+1] === player && 
        board[row][c+2] === player && board[row][c+3] === player) {
      return true;
    }
  }

  // Check vertical
  for (let r = 0; r <= 2; r++) {
    if (board[r][col] === player && board[r+1][col] === player && 
        board[r+2][col] === player && board[r+3][col] === player) {
      return true;
    }
  }

  // Check diagonal /
  for (let r = 3; r < 6; r++) {
    for (let c = 0; c <= 3; c++) {
      if (board[r][c] === player && board[r-1][c+1] === player && 
          board[r-2][c+2] === player && board[r-3][c+3] === player) {
        return true;
      }
    }
  }

  // Check diagonal \
  for (let r = 0; r <= 2; r++) {
    for (let c = 0; c <= 3; c++) {
      if (board[r][c] === player && board[r+1][c+1] === player && 
          board[r+2][c+2] === player && board[r+3][c+3] === player) {
        return true;
      }
    }
  }

  return false;
}

function checkForDraw(board) {
  return board.every(row => row.every(cell => cell !== ''));
}

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'));
});

const port = process.env.PORT || 3001;
server.listen(port, () => console.log(`Server running on port ${port}`));
