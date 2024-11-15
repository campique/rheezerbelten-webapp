import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './ConnectFour.css';

const socket = io('http://localhost:3001');

function ConnectFourOnline() {
  const [playerName, setPlayerName] = useState('');
  const [showLobby, setShowLobby] = useState(false);
  const [tables, setTables] = useState([]);
  const [currentTable, setCurrentTable] = useState(null);
  const [board, setBoard] = useState(Array(6).fill().map(() => Array(7).fill(null)));
  const [currentPlayer, setCurrentPlayer] = useState('red');
  const [winner, setWinner] = useState(null);
  const [scores, setScores] = useState({ red: 0, yellow: 0 });

  useEffect(() => {
    socket.on('tablesUpdate', (updatedTables) => {
      setTables(updatedTables);
    });

    socket.on('joinedTable', (table) => {
      setCurrentTable(table);
      setShowLobby(false);
    });

    socket.on('gameUpdate', (updatedBoard, nextPlayer) => {
      setBoard(updatedBoard);
      setCurrentPlayer(nextPlayer);
    });

    socket.on('gameOver', (winningPlayer, updatedScores) => {
      setWinner(winningPlayer);
      setScores(updatedScores);
    });

    return () => {
      socket.off('tablesUpdate');
      socket.off('joinedTable');
      socket.off('gameUpdate');
      socket.off('gameOver');
    };
  }, []);

  const handleSetName = () => {
    if (playerName.trim()) {
      socket.emit('setName', playerName);
      setShowLobby(true);
    }
  };

  const handleJoinTable = (tableIndex) => {
    socket.emit('joinTable', tableIndex);
  };

  const handleCellClick = (col) => {
    if (currentTable && !winner) {
      socket.emit('makeMove', currentTable.id, col);
    }
  };

  const handlePlayAgain = (choice) => {
    socket.emit('playAgain', currentTable.id, choice);
    if (!choice) {
      setCurrentTable(null);
      setShowLobby(true);
      setWinner(null);
      setBoard(Array(6).fill().map(() => Array(7).fill(null)));
    }
  };

  if (!showLobby && !currentTable) {
    return (
      <div className="connect-four-container">
        <h1 className="connect-four-title">Speel 4 op een rij online</h1>
        <input
          className="connect-four-input"
          type="text"
          placeholder="Voer je naam in"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
        />
        <button className="connect-four-button" onClick={handleSetName}>
          Start
        </button>
      </div>
    );
  }

  if (showLobby) {
    return (
      <div className="connect-four-container">
        <h2 className="connect-four-title">Beschikbare tafels</h2>
        <div className="connect-four-lobby">
          {tables.map((table, index) => (
            <div key={index} className="connect-four-table">
              <div className="table-info">
                <span className="table-name">Tafel {index + 1}</span>
                <span className="player-count">{table.players.length}/2 spelers</span>
              </div>
              <button
                className="connect-four-button join-button"
                onClick={() => handleJoinTable(index)}
                disabled={table.players.length === 2}
              >
                {table.players.length === 2 ? 'Vol' : 'Deelnemen'}
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="connect-four">
      <div className="status">
        {winner
          ? winner === 'draw'
            ? 'Gelijkspel!'
            : `Winnaar: ${winner}`
          : `Huidige speler: ${currentPlayer}`}
      </div>
      <div className="scoreboard">
        Rood: {scores.red} - Geel: {scores.yellow}
      </div>
      <div className="board">
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`cell ${cell || ''}`}
              onClick={() => handleCellClick(colIndex)}
            />
          ))
        )}
      </div>
      {winner && (
        <div className="rematch-section">
          <button onClick={() => handlePlayAgain(true)}>Opnieuw spelen</button>
          <button onClick={() => handlePlayAgain(false)}>Terug naar lobby</button>
        </div>
      )}
    </div>
  );
}

export default ConnectFourOnline;
