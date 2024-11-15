import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';
import io from 'socket.io-client';

console.log('ConnectFourOnline component loaded');

const GameWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
`;

const Board = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-gap: 5px;
  background-color: blue;
  padding: 10px;
  border-radius: 10px;
`;

const Cell = styled.div`
  width: 50px;
  height: 50px;
  background-color: ${props => props.player === 'red' ? 'red' : props.player === 'yellow' ? 'yellow' : 'white'};
  border-radius: 50%;
  cursor: pointer;
`;

const Status = styled.div`
  margin: 20px 0;
  font-size: 24px;
  font-weight: bold;
`;

const Button = styled.button`
  margin: 10px;
  padding: 10px 20px;
  font-size: 18px;
  cursor: pointer;
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
    console.log('useEffect hook running');
    const newSocket = io(window.location.origin);
    console.log('Attempting to connect to socket');

    newSocket.on('connect', () => {
      console.log('Connected to server');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    setSocket(newSocket);

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
      <Button onClick={() => navigate('/')}>Terug naar Lobby</Button>
    </GameWrapper>
  );
};

export default ConnectFourOnline;
