import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import io from 'socket.io-client';
import Confetti from 'react-confetti';
import './ConnectFour.css';

const socket = io(process.env.REACT_APP_SERVER_URL || '');

const GlobalStyle = styled.div`
  font-family: 'Fredoka One', cursive;
`;

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
  width: 100%;
  aspect-ratio: 7 / 6;
`;

const Cell = styled.div`
  width: 100%;
  aspect-ratio: 1 / 1;
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
    ${props => props.isWinning && `
      animation: blink 0.7s ease-in-out infinite;
    `}
  }

  @keyframes blink {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
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

const NameEntryForm = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 300px;
  margin: 0 auto;
`;

const NameInput = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 2px solid #2196F3;
  border-radius: 5px;
  font-size: 1rem;
  font-family: 'Fredoka One', cursive;
`;

function ConnectFourOnline() {
  const [playerName, setPlayerName] = useState('');
  const [gameState, setGameState] = useState('enterName');
  const [tables, setTables] = useState(Array(10).fill({ players: [] }));
  const [currentTable, setCurrentTable] = useState(null);
  const [board, setBoard] = useState(Array(6).fill().map(() => Array(7).fill('')));
  const [currentPlayer, setCurrentPlayer] = useState('');
  const [playerColor, setPlayerColor] = useState('');
  const [status, setStatus] = useState('Wachten op tegenstander...');
  const [showConfetti, setShowConfetti] = useState(false);
  const [scores, setScores] = useState({ red: 0, yellow: 0 });
  const [players, setPlayers] = useState({ red: '', yellow: '' });
  const [winningLine, setWinningLine] = useState([]);

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

    socket.on('gameOver', (winner, winningLine) => {
      console.log('Game over:', winner, winningLine);
      if (winner === 'draw') {
        setStatus('Gelijkspel!');
      } else {
        setStatus(`${players[winner]} wint!`);
        setWinningLine(winningLine || []);
        if (winner === playerColor) {
          setShowConfetti(true);
        }
        setScores(prev => ({ ...prev, [winner]: prev[winner] + 1 }));
      }
      setGameState('gameOver');
    });

    return () => {
      socket.off('tablesUpdate');
      socket.off('joinedTable');
      socket.off('gameStart');
      socket.off('playerColor');
      socket.off('gameUpdate');
      socket.off('gameOver');
    };
  }, [players, playerColor]);

  useEffect(() => {
    if (gameState === 'game') {
      setWinningLine([]);
    }
  }, [gameState]);

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
    if (gameState === 'game' && currentPlayer === playerColor) {
      console.log('Move made:', currentTable.id, col);
      socket.emit('makeMove', currentTable.id, col);
    }
  };

  const playAgain = () => {
    socket.emit('playAgain', currentTable.id);
    setBoard(Array(6).fill().map(() => Array(7).fill('')));
    setStatus('Wachten op tegenstander...');
    setShowConfetti(false);
    setWinningLine([]);
    setGameState('game');
  };

  const renderNameEntry = () => (
    <div className="connect-four-container">
      <h1 className="connect-four-title">Speel 4 op een rij online</h1>
      <NameEntryForm onSubmit={handleNameSubmit}>
        <NameInput
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Voer je naam in"
        />
        <Button type="submit">Start</Button>
      </NameEntryForm>
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
              isCurrentPlayer={currentPlayer === playerColor && gameState === 'game'}
              isWinning={winningLine.some(([r, c]) => r === rowIndex && c === colIndex)}
            />
          ))
        )}
      </Board>
      <Status>{status}</Status>
      {gameState === 'gameOver' && <Button onClick={playAgain}>Nieuw spel</Button>}
    </GameWrapper>
  );

  return (
    <GlobalStyle>
      {gameState === 'enterName' && renderNameEntry()}
      {gameState === 'lobby' && renderLobby()}
      {(gameState === 'game' || gameState === 'gameOver') && renderGame()}
    </GlobalStyle>
  );
}

export default ConnectFourOnline;
