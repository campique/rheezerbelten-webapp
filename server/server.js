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
  socket.on('joinGame', ({ name }) => {
    console.log('Player joining game:', name, socket.id);
    socket.playerName = name;

    waitingPlayer.emit('gameStart', { color: 'red' });
    socket.emit('gameStart', { color: 'yellow' });
    if (waitingPlayer) {
      console.log('Starting game with', waitingPlayer.id, 'and', socket.id);
      const game = {
        players: [waitingPlayer, socket],
        currentPlayer: 'red',
        gameState: Array(6).fill().map(() => Array(7).fill(''))
      };

    waitingPlayer = null;
      waitingPlayer.emit('gameStart', { color: 'red', opponentName: socket.playerName });
      socket.emit('gameStart', { color: 'yellow', opponentName: waitingPlayer.playerName });

    game.players.forEach(player => {
      player.on('makeMove', ({ col }) => {
        console.log('Move made by', player.id, 'in column', col);
        if (player !== game.players[game.currentPlayer === 'red' ? 0 : 1]) return;
      waitingPlayer = null;

        const row = game.gameState.findIndex(r => r[col] === '');
        if (row === -1) return;
      game.players.forEach(player => {
        player.on('makeMove', ({ col }) => {
          if (player !== game.players[game.currentPlayer === 'red' ? 0 : 1]) return;

        game.gameState[row][col] = game.currentPlayer;
        game.currentPlayer = game.currentPlayer === 'red' ? 'yellow' : 'red';
          const row = game.gameState.findIndex(r => r[col] === '');
          if (row === -1) return;

        io.to(game.players[0].id).to(game.players[1].id).emit('gameUpdate', {
          gameState: game.gameState,
          currentPlayer: game.currentPlayer
        });
          game.gameState[row][col] = game.currentPlayer;
          game.currentPlayer = game.currentPlayer === 'red' ? 'yellow' : 'red';

        if (checkForWin(game.gameState, row, col)) {
          io.to(game.players[0].id).to(game.players[1].id).emit('gameOver', {
            winner: game.currentPlayer === 'red' ? 'yellow' : 'red'
          io.to(game.players[0].id).to(game.players[1].id).emit('gameUpdate', {
            gameState: game.gameState,
            currentPlayer: game.currentPlayer
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
    });

  } else {
    console.log('Player waiting:', socket.id);
    waitingPlayer = socket;
    socket.emit('waiting');
  }
    } else {
      console.log('Player waiting:', socket.id);
      waitingPlayer = socket;
    }
  });

socket.on('disconnect', () => {
console.log('Client disconnected', socket.id);
@@ -82,58 +80,37 @@ io.on('connection', (socket) => {
});

function checkForWin(board, row, col) {
  const color = board[row][col];
  
  // Check horizontal
  let count = 0;
  for (let c = 0; c < 7; c++) {
    if (board[row][c] === color) {
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
    r = row;
    c = col;

  // Check diagonal (top-left to bottom-right)
  count = 0;
  let r = row - Math.min(row, col);
  let c = col - Math.min(row, col);
  while (r < 6 && c < 7) {
    if (board[r][c] === color) {
    // Check in negative direction
    while (true) {
      r -= dx;
      c -= dy;
      if (r < 0 || r >= 6 || c < 0 || c >= 7 || board[r][c] !== board[row][col]) break;
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
    if (count >= 4) return true;
}

return false;
@@ -143,8 +120,6 @@ function checkForDraw(board) {
return board.every(row => row.every(cell => cell !== ''));
}

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
res.sendFile(path.join(__dirname, '../build', 'index.html'));
});
