import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import io from 'socket.io-client';
import Confetti from 'react-confetti';

const socket = io(process.env.REACT_APP_SERVER_URL || '');

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
    background: ${props => props.isCurrentPlayer ? '#E3F2FD' : 'white'};
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

const ScoreBoard = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 1rem;
`;

const PlayerScore = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  color: ${props => props.color};
`;

function ConnectFourOnline() {
  const [playerName, setPlayerName] = useState('');
  const [gameState, setGameState] = useState('enterName');
  const [currentTable, setCurrentTable] = useState(null);
  const [board, setBoard] = useState(Array(6).fill().map(() => Array(7).fill('')));
  const [currentPlayer, setCurrentPlayer] = useState('');
  const [playerColor, setPlayerColor] = useState('');
  const [status, setStatus] = useState('Wachten op tegenstander...');
  const [showConfetti, setShowConfetti] = useState(false);
  const [scores, setScores] = useState({ red: 0, yellow: 0 });
  const [players, setPlayers] = useState({ red: '', yellow: '' });

  useEffect(() => {
    socket.on('gameStart', ({ startingPlayer, players: gamePlayers }) => {
      setCurrentPlayer(startingPlayer);
      setPlayers(gamePlayers);
      setGameState('game');
      setStatus(`${gamePlayers[startingPlayer]} is aan de beurt`);
    });

    socket.on('playerColor', (color) => {
      setPlayerColor(color);
    });

    socket.on('gameUpdate', (updatedBoard, nextPlayer) => {
      setBoard(updatedBoard);
      setCurrentPlayer(nextPlayer);
      setStatus(`${players[nextPlayer]} is aan de beurt`);
    });

    socket.on('gameOver', (winner) => {
      if (winner) {
        setStatus(`${players[winner]} wint!`);
        setShowConfetti(true);
        setScores(prev => ({ ...prev, [winner]: prev[winner] + 1 }));
      } else {
        setStatus('Gelijkspel!');
      }
      setGameState('gameOver');
    });

    return () => {
      socket.off('gameStart');
      socket.off('playerColor');
      socket.off('gameUpdate');
      socket.off('gameOver');
    };
  }, [players]);

  const makeMove = (col) => {
    if (gameState === 'game' && currentPlayer === playerColor) {
      socket.emit('makeMove', currentTable.id, col);
    }
  };

  const playAgain = () => {
    socket.emit('playAgain', currentTable.id);
    setBoard(Array(6).fill().map(() => Array(7).fill('')));
    setStatus('Wachten op tegenstander...');
    setShowConfetti(false);
    setGameState('game');
  };

  const renderGame = () => (
    <GameWrapper>
      {showConfetti && <Confetti />}
      <ScoreBoard>
        <PlayerScore color="#F44336">{players.red}: {scores.red}</PlayerScore>
        <PlayerScore color="#FFEB3B">{players.yellow}: {scores.yellow}</PlayerScore>
      </ScoreBoard>
      <Board>
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <Cell
              key={`${rowIndex}-${colIndex}`}
              player={cell}
              onClick={() => makeMove(colIndex)}
              isCurrentPlayer={currentPlayer === playerColor}
            />
          ))
        )}
      </Board>
      <Status>{status}</Status>
      {gameState === 'gameOver' && <button onClick={playAgain}>Nieuw spel</button>}
    </GameWrapper>
  );

  // ... (rest of the component remains the same)

  return (
    <div>
      {gameState === 'enterName' && renderNameEntry()}
      {gameState === 'lobby' && renderLobby()}
      {(gameState === 'game' || gameState === 'gameOver') && renderGame()}
    </div>
  );
}

export default ConnectFourOnline;
