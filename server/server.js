const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, '../build')));

let waitingPlayer = null;

io.on('connection', (socket) => {
  console.log('New client connected', socket.id);

  socket.on('joinGame', ({ name }) => {
    console.log('Player joining game:', name, socket.id);
    socket.playerName = name;

    if (waitingPlayer) {
      console.log('Starting game with', waitingPlayer.id, 'and', socket.id);
      const game = {
        players: [waitingPlayer, socket],
        currentPlayer: 'red',
        gameState: Array(6).fill().map(() => Array(7).fill(''))
      };

      waitingPlayer.emit('gameStart', { color: 'red', opponentName: socket.playerName });
      socket.emit('gameStart', { color: 'yellow', opponentName: waitingPlayer.playerName });

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
      console.log('Player waiting:', socket.id);
      waitingPlayer = socket;
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected', socket.id);
    if (waitingPlayer === socket) {
      waitingPlayer = null;
    }
  });
});

function checkForWin(board, row, col) {
  const directions = [
    [0, 1],  // horizontal
    [1, 0],  // vertical
    [1, 1],  // diagonal down-right
    [1, -1]  // diagonal down-left
  ];

  for (let [dx, dy] of directions) {
    let count = 1;
    let r = row, c = col;

    // Check in positive direction
    while (true) {
      r += dx;
      c += dy;
      if (r < 0 || r >= 6 || c < 0 || c >= 7 || board[r][c] !== board[row][col]) break;
      count++;
    }

    r = row;
    c = col;

    // Check in negative direction
    while (true) {
      r -= dx;
      c -= dy;
      if (r < 0 || r >= 6 || c < 0 || c >= 7 || board[r][c] !== board[row][col]) break;
      count++;
    }

    if (count >= 4) return true;
  }

  return false;
}

function checkForDraw(board) {
  return board.every(row => row.every(cell => cell !== ''));
}

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

const port = process.env.PORT || 3001;
server.listen(port, () => console.log(`Server running on port ${port}`));
