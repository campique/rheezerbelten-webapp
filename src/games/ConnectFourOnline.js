import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './ConnectFour.css';

const socket = io(process.env.REACT_APP_SERVER_URL || '');

function ConnectFourOnline() {
  const [playerName, setPlayerName] = useState('');
  const [gameState, setGameState] = useState('enterName'); // 'enterName', 'lobby', 'game', 'gameOver'
  const [tables, setTables] = useState(Array(10).fill({ players: [] }));
  const [currentTable, setCurrentTable] = useState(null);
  const [board, setBoard] = useState(Array(6).fill().map(() => Array(7).fill(null)));
  const [currentPlayer, setCurrentPlayer] = useState('red');
  const [scores, setScores] = useState({ red: 0, yellow: 0 });
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    socket.on('tablesUpdate', (updatedTables) => {
      setTables(updatedTables);
    });

    socket.on('joinedTable', (table) => {
      setCurrentTable(table);
      if (table.players.length === 2) {
        setGameState('game');
      }
    });

    socket.on('gameUpdate', (updatedBoard, nextPlayer) => {
      setBoard(updatedBoard);
      setCurrentPlayer(nextPlayer);
    });

    socket.on('gameOver', (winner, updatedScores) => {
      setWinner(winner);
      setScores(updatedScores);
      setGameState('gameOver');
    });

    return () => {
      socket.off('tablesUpdate');
      socket.off('joinedTable');
      socket.off('gameUpdate');
      socket.off('gameOver');
    };
  }, []);

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (playerName.trim()) {
      socket.emit('setName', playerName);
      setGameState('lobby');
    }
  };

  const joinTable = (tableIndex) => {
    socket.emit('joinTable', tableIndex);
  };

  const makeMove = (col) => {
    socket.emit('makeMove', currentTable.id, col);
  };

  const playAgain = (choice) => {
    socket.emit('playAgain', currentTable.id, choice);
    if (!choice) {
      setGameState('lobby');
      setCurrentTable(null);
    }
  };

  const renderNameEntry = () => (
    <div className="connect-four-container">
      <h1 className="connect-four-title">Speel 4 op een rij online</h1>
      <form onSubmit={handleNameSubmit}>
        <input
          className="connect-four-input"
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Voer je naam in"
        />
        <button className="connect-four-button" type="submit">Start</button>
      </form>
    </div>
  );

  const renderLobby = () => (
    <div className="connect-four-container">
      <h2 className="connect-four-title">Beschikbare tafels</h2>
      <div className="connect-four-lobby-scroll">
        <div className="connect-four-lobby">
          {tables.map((table, index) => (
            <div key={index} className="connect-four-table">
              <div className="table-info">
                <span className="table-name">Tafel {index + 1}</span>
                <span className="player-count">{table.players.length}/2 spelers</span>
              </div>
              {table.players.map((player, i) => (
                <p key={i} className="player-name">{player.name}</p>
              ))}
              {table.players.length < 2 && (
                <button
                  className="connect-four-button join-button"
                  onClick={() => joinTable(index)}
                >
                  Deelnemen
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderGame = () => (
    <div className="connect-four">
      <div className="status">
        Huidige Speler: {currentPlayer}
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
              onClick={() => makeMove(colIndex)}
            />
          ))
        )}
      </div>
    </div>
  );

  const renderGameOver = () => (
    <div className="connect-four-container">
      <h2 className="connect-four-title">Spel Afgelopen</h2>
      <p>{winner ? `Winnaar: ${winner}` : 'Gelijkspel!'}</p>
      <p>Scores: Rood {scores.red} - {scores.yellow} Geel</p>
      <p>Nog een potje spelen?</p>
      <button className="connect-four-button" onClick={() => playAgain(true)}>Ja</button>
      <button className="connect-four-button" onClick={() => playAgain(false)}>Nee</button>
    </div>
  );

  return (
    <div>
      {gameState === 'enterName' && renderNameEntry()}
      {gameState === 'lobby' && renderLobby()}
      {gameState === 'game' && renderGame()}
      {gameState === 'gameOver' && renderGameOver()}
    </div>
  );
}

export default ConnectFourOnline;
