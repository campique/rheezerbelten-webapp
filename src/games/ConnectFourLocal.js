import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';

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

const ConnectFourLocal = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState(Array(6).fill().map(() => Array(7).fill('')));
  const [currentPlayer, setCurrentPlayer] = useState('red');
  const [gameActive, setGameActive] = useState(true);
  const [status, setStatus] = useState('Rode speler is aan de beurt');
  const [showConfetti, setShowConfetti] = useState(false);

  const handleCellClick = (col) => {
    if (!gameActive) return;
    makeMove(col);
  };

  const makeMove = (col) => {
    try {
      const updatedState = [...gameState];
      for (let row = 5; row >= 0; row--) {
        if (updatedState[row][col] === '') {
          updatedState[row][col] = currentPlayer;
          setGameState(updatedState);
          if (checkForWin(row, col, currentPlayer)) {
            setStatus(`${currentPlayer === 'red' ? 'Rode' : 'Gele'} speler wint!`);
            setGameActive(false);
            setShowConfetti(true);
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
    } catch (error) {
      console.error('Error in makeMove:', error);
      setStatus('Er is een fout opgetreden. Probeer het opnieuw.');
    }
  };

  const checkForWin = (row, col, player, board = gameState) => {
    // Horizontaal
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 4; c++) {
        if (board[r][c] === player && board[r][c+1] === player && 
            board[r][c+2] === player && board[r][c+3] === player) {
          return true;
        }
      }
    }

    // Verticaal
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 7; c++) {
        if (board[r][c] === player && board[r+1][c] === player && 
            board[r+2][c] === player && board[r+3][c] === player) {
          return true;
        }
      }
    }

    // Diagonaal /
    for (let r = 3; r < 6; r++) {
      for (let c = 0; c < 4; c++) {
        if (board[r][c] === player && board[r-1][c+1] === player && 
            board[r-2][c+2] === player && board[r-3][c+3] === player) {
          return true;
        }
      }
    }

    // Diagonaal \
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 4; c++) {
        if (board[r][c] === player && board[r+1][c+1] === player && 
            board[r+2][c+2] === player && board[r+3][c+3] === player) {
          return true;
        }
      }
    }

    return false;
  };

  const checkForDraw = (board = gameState) => {
    return board.every(row => row.every(cell => cell !== ''));
  };

  const resetGame = () => {
    setGameState(Array(6).fill().map(() => Array(7).fill('')));
    setCurrentPlayer('red');
    setGameActive(true);
    setStatus('Rode speler is aan de beurt');
    setShowConfetti(false);
  };

  return (
    <GameWrapper>
      {showConfetti && <Confetti />}
      <h2>4 op een Rij - Lokaal spel</h2>
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
