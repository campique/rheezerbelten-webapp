// src/components/ConnectFour.js
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './ConnectFour.css';

const ROWS = 6;
const COLS = 7;

const ConnectFour = () => {
  const [socket, setSocket] = useState(null);
  const [gameState, setGameState] = useState(Array(ROWS).fill().map(() => Array(COLS).fill('')));
  const [currentPlayer, setCurrentPlayer] = useState('red');
  const [gameActive, setGameActive] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [opponentName, setOpponentName] = useState('');
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [status, setStatus] = useState('');
  const [showRematch, setShowRematch] = useState(false);

  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);

    newSocket.on('gameStarted', handleGameStarted);
    newSocket.on('gameUpdated', handleGameUpdated);
    newSocket.on('gameOver', handleGameOver);
    newSocket.on('askRematch', handleAskRematch);
    newSocket.on('opponentLeft', handleOpponentLeft);

    return () => newSocket.close();
  }, []);

  const handleCellClick = (col) => {
    if (!gameActive || currentPlayer !== playerName) return;
    socket.emit('makeMove', { col });
  };

  const handleGameStarted = (game) => {
    setGameState(game.board);
    setCurrentPlayer(game.currentPlayer);
    setGameActive(true);
    setStatus(`${game.currentPlayer === playerName ? 'Jouw' : 'Tegenstander\'s'} beurt`);
  };

  const handleGameUpdated = (game) => {
    setGameState(game.board);
    setCurrentPlayer(game.currentPlayer);
    setStatus(`${game.currentPlayer === playerName ? 'Jouw' : 'Tegenstander\'s'} beurt`);
  };

  const handleGameOver = ({ winner }) => {
    setGameActive(false);
    if (winner === 'draw') {
      setStatus("Gelijkspel!");
    } else {
      if (winner === playerName) {
        setPlayerScore(prevScore => prevScore + 1);
        setStatus("Jij wint!");
      } else {
        setOpponentScore(prevScore => prevScore + 1);
        setStatus("Tegenstander wint!");
      }
    }
    setShowRematch(true);
  };

  const handleAskRematch = () => {
    setShowRematch(true);
  };

  const handleOpponentLeft = () => {
    setStatus("Tegenstander heeft het spel verlaten");
    setGameActive(false);
  };

  const handleRematch = (vote) => {
    socket.emit('rematchVote', { vote });
    setShowRematch(false);
  };

  return (
    <div className="connect-four">
      <h2>4 op een Rij</h2>
      <div className="board">
        {gameState.map((row, rowIndex) => (
          <div key={rowIndex} className="row">
            {row.map((cell, colIndex) => (
              <div
                key={colIndex}
                className={`cell ${cell}`}
                onClick={() => handleCellClick(colIndex)}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="status">{status}</div>
      <div className="scoreboard">
        {playerName}: {playerScore} - {opponentName}: {opponentScore}
      </div>
      {showRematch && (
        <div className="rematch-section">
          <p>Wil je nog een keer spelen?</p>
          <button onClick={() => handleRematch(true)}>Ja</button>
          <button onClick={() => handleRematch(false)}>Nee</button>
        </div>
      )}
    </div>
  );
};

export default ConnectFour;
