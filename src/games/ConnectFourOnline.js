import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';
import io from 'socket.io-client';

const GameWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
`;

const Board = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-gap: 5px;
  background-color: #2196F3;
  padding: 10px;
  border-radius: 10px;
  margin: 1rem 0;
  width: 100%;
  max-width: 100%;
`;

const Cell = styled.div`
  width: 100%;
  padding-bottom: 100%;
  background: white;
  border-radius: 50%;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #E3F2FD;
  }

  &::after {
    content: '';
    position: absolute;
    top: 5%;
    left: 5%;
    width: 90%;
    height: 90%;
    border-radius: 50%;
    background-color: ${props => props.player === 'red' ? '#F44336' : props.player === 'yellow' ? '#FFEB3B' : 'transparent'};
  }
`;

const Status = styled.div`
  font-size: 1.2rem;
  margin: 1rem 0;
  color: #2196F3;
  font-weight: bold;
`;

const Button = styled.button`
  color: white;
  font-weight: bold;
  padding: 0.8rem 1.2rem;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  margin: 0.5rem;
  background-color: #00c853;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 8px -2px rgba(0, 0, 0, 0.15);
  }
`;

const ConnectFourOnline = () => {
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [gameState, setGameState] = useState(Array(6).fill().map(() => Array(7).fill('')));
  const [currentPlayer, setCurrentPlayer] = useState('red');
  const [gameActive, setGameActive] = useState(false);
  const [status, setStatus] = useState('Wachten op tegenstander...');
  const [showConfetti, setShowConfetti] = useState(false);
  const [playerColor, setPlayerColor] = useState(null);

  useEffect(() => {
    console.log('Attempting to connect to socket');
    const newSocket = io(window.location.origin);
    console.log('Socket connection established');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server');
    });

    newSocket.on('gameStart', ({ color }) => {
      console.log('Game started, player color:', color);
      setPlayerColor(color);
      setGameActive(true);
      setStatus(`${color === 'red' ? 'Rode' : 'Gele'} speler is aan de beurt`);
    });

    newSocket.on('gameUpdate', ({ gameState, currentPlayer }) => {
      console.log('Game updated', gameState, currentPlayer);
      setGameState(gameState);
      setCurrentPlayer(currentPlayer);
      setStatus(`${currentPlayer === 'red' ? 'Rode' : 'Gele'} speler is aan de beurt`);
    });

    newSocket.on('gameOver', ({ winner }) => {
      console.log('Game over, winner:', winner);
      setGameActive(false);
      if (winner === 'draw') {
        setStatus('Gelijkspel!');
      } else {
        setStatus(`${winner === 'red' ? 'Rode' : 'Gele'} speler wint!`);
        setShowConfetti(true);
      }
    });

    newSocket.on('waiting', () => {
      console.log('Waiting for opponent');
      setStatus('Wachten op tegenstander...');
    });

    return () => {
      console.log('Disconnecting socket');
      newSocket.close();
    };
  }, []);

  const handleCellClick = (col) => {
    if (!gameActive || currentPlayer !== playerColor) return;
    console.log('Making move', col);
    socket.emit('makeMove', { col });
  };

  const resetGame = () => {
    console.log('Resetting game');
    socket.emit('resetGame');
  };

  return (
    <GameWrapper>
      {showConfetti && <Confetti />}
      <h2>4 op een Rij - Online spel</h2>
      <Board>
        {gameState.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <Cell
              key={`${rowIndex}-${colIndex}`}
              player={cell}
              onClick={() => handleCellClick(colIndex)}
            />
          ))
        )}
      </Board>
      <Status>{status}</Status>
      <Button onClick={resetGame} disabled={!gameActive}>Reset Spel</Button>
      <Button onClick={() => navigate('/')}>Terug naar Home</Button>
    </GameWrapper>
  );
};

export default ConnectFourOnline;
