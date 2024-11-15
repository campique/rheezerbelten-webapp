const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

console.log('Server initialized, waiting for connections');

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../build')));

let waitingPlayer = null;

io.on('connection', (socket) => {
  console.log('New client connected', socket.id);

  if (waitingPlayer) {
    console.log('Starting game with', waitingPlayer.id, 'and', socket.id);
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
        console.log('Move made by', player.id, 'in column', col);
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
        console.log('Game reset by', player.id);
        game.gameState = Array(6).fill().map(() => Array(7).fill(''));
        game.currentPlayer = 'red';
        io.to(game.players[0].id).to(game.players[1].id).emit('gameUpdate', {
          gameState: game.gameState,
          currentPlayer: game.currentPlayer
        });
      });
    });

  } else {
    console.log('Player waiting:', socket.id);
    waitingPlayer = socket;
    socket.emit('waiting');
  }

  socket.on('disconnect', () => {
    console.log('Client disconnected', socket.id);
    if (waitingPlayer === socket) {
      waitingPlayer = null;
    }
  });
});

function checkForWin(board, row, col) {
  const color = board[row][col];
  
  // Check horizontal
  let count = 0;
  for (let c = 0; c < 7; c++) {
    if (board[row][c] === color) {
      count++;
      if (count === 4) return true;
    } else {
      count = 0;
    }
  }

  // Check vertical
  count = 0;
  for (let r = 0; r < 6; r++) {
    if (board[r][col] === color) {
      count++;
      if (count === 4) return true;
    } else {
      count = 0;
    }
  }

  // Check diagonal (top-left to bottom-right)
  count = 0;
  let r = row - Math.min(row, col);
  let c = col - Math.min(row, col);
  while (r < 6 && c < 7) {
    if (board[r][c] === color) {
      count++;
      if (count === 4) return true;
    } else {
      count = 0;
    }
    r++;
    c++;
  }

  // Check diagonal (top-right to bottom-left)
  count = 0;
  r = row - Math.min(row, 6 - col);
  c = col + Math.min(row, 6 - col);
  while (r < 6 && c >= 0) {
    if (board[r][c] === color) {
      count++;
      if (count === 4) return true;
    } else {
      count = 0;
    }
    r++;
    c--;
  }

  return false;
}

function checkForDraw(board) {
  return board.every(row => row.every(cell => cell !== ''));
}

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

const port = process.env.PORT || 3001;
server.listen(port, () => console.log(`Server running on port ${port}`));
