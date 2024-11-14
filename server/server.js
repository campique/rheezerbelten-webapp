const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: {
    origin: "http://localhost:3000", // Pas dit aan naar de URL van je React app
    methods: ["GET", "POST"]
  }
});
const path = require('path');

app.use(express.static(path.join(__dirname, '..', 'build')));

const tables = Array(1).fill().map(() => ({ players: [], gameState: null, rematchVotes: [] }));

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('joinTable', (tableId) => {
        if (tables[tableId].players.length < 2) {
            tables[tableId].players.push({ id: socket.id });
            socket.join(`table-${tableId}`);

            if (tables[tableId].players.length === 2) {
                const [player1, player2] = tables[tableId].players;
                io.to(player1.id).emit('joinedTable', { playerId: 'red', opponentName: 'Opponent' });
                io.to(player2.id).emit('joinedTable', { playerId: 'yellow', opponentName: 'Opponent' });
                
                startNewGame(tableId);
            } else {
                socket.emit('joinedTable', { playerId: 'red', opponentName: '' });
            }
        }
    });

    socket.on('makeMove', ({ tableId, col }) => {
        const table = tables[tableId];
        if (table && table.gameState) {
            const playerIndex = table.players.findIndex(player => player.id === socket.id);
            const playerColor = playerIndex === 0 ? 'red' : 'yellow';
            
            if (playerColor !== table.gameState.currentPlayer) {
                return;
            }

            const row = findLowestEmptyRow(table.gameState.board, col);
            if (row !== -1) {
                table.gameState.board[row][col] = playerColor;

                if (checkWin(table.gameState.board, row, col)) {
                    io.to(`table-${tableId}`).emit('gameUpdated', table.gameState);
                    io.to(`table-${tableId}`).emit('gameOver', { winner: playerColor });
                    askForRematch(tableId);
                } else if (checkDraw(table.gameState.board)) {
                    io.to(`table-${tableId}`).emit('gameUpdated', table.gameState);
                    io.to(`table-${tableId}`).emit('gameOver', { winner: 'draw' });
                    askForRematch(tableId);
                } else {
                    table.gameState.currentPlayer = table.gameState.currentPlayer === 'red' ? 'yellow' : 'red';
                    io.to(`table-${tableId}`).emit('gameUpdated', table.gameState);
                }
            }
        }
    });

    socket.on('leaveTable', (tableId) => {
        const table = tables[tableId];
        if (table) {
            table.players = table.players.filter(player => player.id !== socket.id);
            socket.leave(`table-${tableId}`);
            io.to(`table-${tableId}`).emit('opponentLeft');
            resetTable(tableId);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
        for (let i = 0; i < tables.length; i++) {
            const table = tables[i];
            const playerIndex = table.players.findIndex(player => player.id === socket.id);
            if (playerIndex !== -1) {
                table.players.splice(playerIndex, 1);
                io.to(`table-${i}`).emit('opponentLeft');
                resetTable(i);
                break;
            }
        }
    });
});

function startNewGame(tableId) {
    tables[tableId].gameState = {
        board: Array(6).fill().map(() => Array(7).fill('')),
        currentPlayer: 'red'
    };
    tables[tableId].rematchVotes = [null, null];
    io.to(`table-${tableId}`).emit('gameStarted', tables[tableId].gameState);
}

function resetTable(tableId) {
    tables[tableId].gameState = null;
    tables[tableId].rematchVotes = [];
    tables[tableId].players = [];
}

function askForRematch(tableId) {
    io.to(`table-${tableId}`).emit('askRematch');
}

function findLowestEmptyRow(board, col) {
    for (let row = 5; row >= 0; row--) {
        if (board[row][col] === '') {
            return row;
        }
    }
    return -1;
}

function checkWin(board, row, col) {
    const player = board[row][col];
    const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
    
    for (const [dx, dy] of directions) {
        if (countPieces(board, row, col, dx, dy, player) + countPieces(board, row, col, -dx, -dy, player) - 1 >= 4) {
            return true;
        }
    }
    return false;
}

function countPieces(board, row, col, dx, dy, player) {
    let count = 0;
    while (row >= 0 && row < 6 && col >= 0 && col < 7 && board[row][col] === player) {
        count++;
        row += dx;
        col += dy;
    }
    return count;
}

function checkDraw(board) {
    return board.every(row => row.every(cell => cell !== ''));
}

const PORT = process.env.PORT || 3001;
http.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
