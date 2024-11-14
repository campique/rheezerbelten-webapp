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

const ConnectFourMultiplayer = () => {
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [gameState, setGameState] = useState(Array(6).fill().map(() => Array(7).fill('')));
  const [currentPlayer, setCurrentPlayer] = useState('red');
  const [gameActive, setGameActive] = useState(false);
  const [status, setStatus] = useState('Wachten op tegenstander...');
  const [showConfetti, setShowConfetti] = useState(false);
  const [playerColor, setPlayerColor] = useState(null);

  useEffect(() => {
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    newSocket.on('joinedTable', ({ playerId, opponentName }) => {
      setPlayerColor(playerId);
      setStatus(`Je speelt als ${playerId === 'red' ? 'rood' : 'geel'}. Wachten op ${opponentName || 'tegenstander'}...`);
    });

    newSocket.on('gameStarted', (game) => {
      setGameState(game.board);
      setCurrentPlayer(game.currentPlayer);
      setGameActive(true);
      setStatus(`${game.currentPlayer === playerColor ? 'Jouw' : 'Tegenstander\'s'} beurt`);
    });

    newSocket.on('gameUpdated', (game) => {
      setGameState(game.board);
      setCurrentPlayer(game.currentPlayer);
      setStatus(`${game.currentPlayer === playerColor ? 'Jouw' : 'Tegenstander\'s'} beurt`);
    });

    newSocket.on('gameOver', ({ winner }) => {
      setGameActive(false);
      if (winner === 'draw') {
        setStatus('Gelijkspel!');
      } else {
        setStatus(winner === playerColor ? 'Je hebt gewonnen!' : 'Je hebt verloren!');
        setShowConfetti(winner === playerColor);
      }
    });

    newSocket.on('askRematch', () => {
      // Implementeer hier de rematch logica
    });

    newSocket.on('returnToLobby', () => {
      navigate('/games/connect-four');
    });

    newSocket.on('opponentLeft', () => {
      setStatus('Tegenstander heeft het spel verlaten');
      setGameActive(false);
    });

    return () => newSocket.close();
  }, [navigate, playerColor]);

  const handleCellClick = (col) => {
    if (!gameActive || currentPlayer !== playerColor) return;
    socket.emit('makeMove', { tableId: 0, col });
  };

  const joinGame = () => {
    socket.emit('joinTable', 0);
  };

  const leaveGame = () => {
    socket.emit('leaveTable', 0);
    navigate('/games/connect-four');
  };

  return (
    <GameWrapper>
      {showConfetti && <Confetti />}
      <h2>4 op een Rij - Multiplayer</h2>
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
      {!gameActive && <Button onClick={joinGame}>Spel starten</Button>}
      <Button onClick={leaveGame}>Verlaat spel</Button>
    </GameWrapper>
  );
};

export default ConnectFourMultiplayer;
