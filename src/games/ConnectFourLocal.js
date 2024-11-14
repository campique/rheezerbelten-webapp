import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const GameWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 600px;
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

const ConnectFourLocal = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState(Array(6).fill().map(() => Array(7).fill('')));
  const [currentPlayer, setCurrentPlayer] = useState('red');
  const [gameActive, setGameActive] = useState(true);
  const [status, setStatus] = useState('Rode speler is aan de beurt');

  const handleCellClick = (col) => {
    if (!gameActive) return;
    
    const updatedState = [...gameState];
    for (let row = 5; row >= 0; row--) {
      if (updatedState[row][col] === '') {
        updatedState[row][col] = currentPlayer;
        setGameState(updatedState);
        if (checkForWin(row, col, currentPlayer)) {
          setStatus(`${currentPlayer === 'red' ? 'Rode' : 'Gele'} speler wint!`);
          setGameActive(false);
        } else if (checkForDraw()) {
          setStatus('Gelijkspel!');
          setGameActive(false);
        } else {
          setCurrentPlayer(currentPlayer === 'red' ? 'yellow' : 'red');
          setStatus(`${currentPlayer === 'red' ? 'Gele' : 'Rode'} speler is aan de beurt`);
        }
        break;
      }
    }
  };

  const checkForWin = (row, col, player) => {
    // Horizontaal
    if (checkLine(row, 0, 0, 1, player)) return true;
    // Verticaal
    if (checkLine(0, col, 1, 0, player)) return true;
    // Diagonaal /
    if (checkLine(Math.max(row - Math.min(col, 3), 0), Math.max(col - Math.min(row, 3), 0), 1, 1, player)) return true;
    // Diagonaal \
    if (checkLine(Math.max(row - Math.min(6 - col, 3), 0), Math.min(col + Math.min(row, 3), 6), 1, -1, player)) return true;

    return false;
  };

  const checkLine = (startRow, startCol, rowInc, colInc, player) => {
    let count = 0;
    for (let i = 0; i < 7; i++) {
      const row = startRow + i * rowInc;
      const col = startCol + i * colInc;
      if (row < 0 || row >= 6 || col < 0 || col >= 7) break;
      if (gameState[row][col] === player) {
        count++;
        if (count === 4) return true;
      } else {
        count = 0;
      }
    }
    return false;
  };

  const checkForDraw = () => {
    return gameState.every(row => row.every(cell => cell !== ''));
  };

  const resetGame = () => {
    setGameState(Array(6).fill().map(() => Array(7).fill('')));
    setCurrentPlayer('red');
    setGameActive(true);
    setStatus('Rode speler is aan de beurt');
  };

  return (
    <GameWrapper>
      <h2>4 op een Rij - Lokaal</h2>
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
      <Button onClick={resetGame}>Nieuw spel</Button>
      <Button onClick={() => navigate('/games/connect-four')}>Terug naar opties</Button>
    </GameWrapper>
  );
};

export default ConnectFourLocal;
