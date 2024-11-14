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

app.use(express.static(path.join(__dirname, 'build')));

const tables = Array(5).fill().map(() => ({ players: [], gameState: null, rematchVotes: [] }));

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    let playerName = '';

    socket.on('setName', (name) => {
        playerName = name;
        console.log(`Player ${name} (${socket.id}) set name`);
        const tableUpdate = tables.map(table => ({ players: table.players.length }));
        console.log('Sending table update:', tableUpdate);
        socket.emit('tablesUpdate', tableUpdate);
    });

    socket.on('getTables', () => {
        console.log('getTables requested by', socket.id);
        const tableUpdate = tables.map(table => ({ players: table.players.length }));
        console.log('Sending table update:', tableUpdate);
        socket.emit('tablesUpdate', tableUpdate);
    });

    socket.on('joinTable', (tableIndex) => {
        console.log(`Player ${playerName} (${socket.id}) attempting to join table ${tableIndex}`);
        if (tables[tableIndex].players.length < 2) {
            tables[tableIndex].players.push({ id: socket.id, name: playerName });
            socket.join(`table-${tableIndex}`);

            if (tables[tableIndex].players.length === 2) {
                const [player1, player2] = tables[tableIndex].players;
                console.log(`Table ${tableIndex} full, starting game`);
                io.to(player1.id).emit('joinedTable', { tableId: tableIndex, playerId: 'red', opponentName: player2.name });
                io.to(player2.id).emit('joinedTable', { tableId: tableIndex, playerId: 'yellow', opponentName: player1.name });
                
                startNewGame(tableIndex);
            } else {
                console.log(`Player ${playerName} (${socket.id}) joined table ${tableIndex}, waiting for opponent`);
                socket.emit('joinedTable', { tableId: tableIndex, playerId: 'red', opponentName: '' });
            }

            const tableUpdate = tables.map(table => ({ players: table.players.length }));
            console.log('Sending updated table list:', tableUpdate);
            io.emit('tablesUpdate', tableUpdate);
        } else {
            console.log(`Table ${tableIndex} is full, player ${playerName} (${socket.id}) could not join`);
            socket.emit('tableJoinError', 'This table is full');
        }
    });

    socket.on('makeMove', ({ tableId, col }) => {
        console.log(`Player ${playerName} (${socket.id}) making move on table ${tableId}, column ${col}`);
        const table = tables[tableId];
        if (table && table.gameState) {
            const playerIndex = table.players.findIndex(player => player.id === socket.id);
            const playerColor = playerIndex === 0 ? 'red' : 'yellow';
            
            if (playerColor !== table.gameState.currentPlayer) {
                console.log(`Invalid move: not ${playerName}'s turn`);
                return;
            }

            const row = findLowestEmptyRow(table.gameState.board, col);
            if (row !== -1) {
                table.gameState.board[row][col] = playerColor;
                console.log(`Move made: row ${row}, col ${col}, color ${playerColor}`);

                if (checkWin(table.gameState.board, row, col)) {
                    console.log(`Player ${playerName} wins!`);
                    io.to(`table-${tableId}`).emit('gameUpdated', table.gameState);
                    io.to(`table-${tableId}`).emit('gameOver', { winner: playerColor });
                    askForRematch(tableId);
                } else if (checkDraw(table.gameState.board)) {
                    console.log(`Game ended in a draw`);
                    io.to(`table-${tableId}`).emit('gameUpdated', table.gameState);
                    io.to(`table-${tableId}`).emit('gameOver', { winner: 'draw' });
                    askForRematch(tableId);
                } else {
                    table.gameState.currentPlayer = table.gameState.currentPlayer === 'red' ? 'yellow' : 'red';
                    console.log(`Turn passed to ${table.gameState.currentPlayer}`);
                    io.to(`table-${tableId}`).emit('gameUpdated', table.gameState);
                }
            } else {
                console.log(`Invalid move: column ${col} is full`);
            }
        } else {
            console.log(`Invalid move: no active game on table ${tableId}`);
        }
    });

    socket.on('rematchVote', ({ tableId, vote }) => {
        console.log(`Player ${playerName} (${socket.id}) voted ${vote} for rematch on table ${tableId}`);
        const table = tables[tableId];
        if (table) {
            const playerIndex = table.players.findIndex(player => player.id === socket.id);
            table.rematchVotes[playerIndex] = vote;

            if (table.rematchVotes.filter(v => v !== null).length === 2) {
                if (table.rematchVotes.every(v => v === true)) {
                    console.log(`Both players agreed to rematch on table ${tableId}`);
                    startNewGame(tableId);
                } else {
                    console.log(`Rematch declined on table ${tableId}, returning to lobby`);
                    io.to(`table-${tableId}`).emit('returnToLobby');
                    resetTable(tableId);
                }
            }
        }
    });

    socket.on('leaveTable', (tableId) => {
        console.log(`Player ${playerName} (${socket.id}) leaving table ${tableId}`);
        const table = tables[tableId];
        if (table) {
            const playerIndex = table.players.findIndex(player => player.id === socket.id);
            if (playerIndex !== -1) {
                table.players.splice(playerIndex, 1);
                socket.leave(`table-${tableId}`);
                io.to(`table-${tableId}`).emit('opponentLeft');
                resetTable(tableId);
                const tableUpdate = tables.map(table => ({ players: table.players.length }));
                console.log('Sending updated table list after player left:', tableUpdate);
                io.emit('tablesUpdate', tableUpdate);
            }
        }
    });

    socket.on('disconnect', () => {
        console.log(`Player ${playerName} (${socket.id}) disconnected`);
        for (let i = 0; i < tables.length; i++) {
            const table = tables[i];
            const playerIndex = table.players.findIndex(player => player.id === socket.id);
            if (playerIndex !== -1) {
                table.players.splice(playerIndex, 1);
                io.to(`table-${i}`).emit('opponentLeft');
                resetTable(i);
                const tableUpdate = tables.map(table => ({ players: table.players.length }));
                console.log('Sending updated table list after disconnect:', tableUpdate);
                io.emit('tablesUpdate', tableUpdate);
                break;
            }
        }
    });
});

function startNewGame(tableId) {
    console.log(`Starting new game on table ${tableId}`);
    tables[tableId].gameState = {
        board: Array(6).fill().map(() => Array(7).fill('')),
        currentPlayer: 'red'
    };
    tables[tableId].rematchVotes = [null, null];
    io.to(`table-${tableId}`).emit('gameStarted', tables[tableId].gameState);
}

function resetTable(tableId) {
    console.log(`Resetting table ${tableId}`);
    tables[tableId].gameState = null;
    tables[tableId].rematchVotes = [];
    tables[tableId].players.forEach(player => {
        const socket = io.sockets.sockets.get(player.id);
        if (socket) {
            socket.leave(`table-${tableId}`);
        }
    });
    tables[tableId].players = [];
    const tableUpdate = tables.map(table => ({ players: table.players.length }));
    console.log('Sending updated table list after reset:', tableUpdate);
    io.emit('tablesUpdate', tableUpdate);
}

function askForRematch(tableId) {
    console.log(`Asking for rematch on table ${tableId}`);
    tables[tableId].rematchVotes = [null, null];
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
    const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
    const color = board[row][col];

    for (const [dx, dy] of directions) {
        if (countConsecutive(board, row, col, dx, dy, color) >= 4) {
            return true;
        }
    }
    return false;
}

function countConsecutive(board, row, col, dx, dy, color) {
    let count = 0;
    for (let i = -3; i <= 3; i++) {
        const newRow = row + i * dx;
        const newCol = col + i * dy;
        if (newRow >= 0 && newRow < 6 && newCol >= 0 && newCol < 7 && board[newRow][newCol] === color) {
            count++;
            if (count === 4) return count;
        } else {
            count = 0;
        }
    }
    return count;
}

function checkDraw(board) {
    return board.every(row => row.every(cell => cell !== ''));
}

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
