import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import io from 'socket.io-client';

const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  background-color: #f0f0f0;
  min-height: 100vh;
`;

const Board = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-gap: 10px;
  background-color: #2196F3;
  padding: 10px;
  border-radius: 10px;
  margin: 2rem 0;
`;

const Cell = styled.div`
  width: 50px;
  height: 50px;
  background-color: white;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.3s;

  &.red {
    background-color: #F44336;
  }

  &.yellow {
    background-color: #FFEB3B;
  }

  &:hover {
    background-color: ${props => props.active ? '#E3F2FD' : 'white'};
  }
`;

const Status = styled.div`
  font-size: 1.2rem;
  margin: 1rem 0;
  color: #333;
`;

const ScoreBoard = styled.div`
  font-size: 1.2rem;
  margin: 1rem 0;
  color: #333;
`;

const Button = styled.button`
  margin: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #45a049;
  }
`;

const BackButton = styled(Link)`
  margin-top: 2rem;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  background-color: #2196F3;
  color: white;
  text-decoration: none;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #1E88E5;
  }
`;

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
    <GameContainer>
      <h2>4 op een Rij</h2>
      <Board>
        {gameState.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <Cell
              key={`${rowIndex}-${colIndex}`}
              className={cell}
              onClick={() => handleCellClick(colIndex)}
              active={gameActive && currentPlayer === playerName}
            />
          ))
        )}
      </Board>
      <Status>{status}</Status>
      <ScoreBoard>
        {playerName}: {playerScore} - {opponentName}: {opponentScore}
      </ScoreBoard>
      {showRematch && (
        <div>
          <p>Wil je nog een keer spelen?</p>
          <Button onClick={() => handleRematch(true)}>Ja</Button>
          <Button onClick={() => handleRematch(false)}>Nee</Button>
        </div>
      )}
      <BackButton to="/games">Terug naar spelletjes</BackButton>
    </GameContainer>
  );
};

export default ConnectFour;
