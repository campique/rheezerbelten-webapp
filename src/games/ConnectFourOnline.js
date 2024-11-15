import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import io from 'socket.io-client';
import Confetti from 'react-confetti';
import './ConnectFour.css';

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

function ConnectFourOnline() {
  const [playerName, setPlayerName] = useState('');
  const [gameState, setGameState] = useState('enterName'); // 'enterName', 'lobby', 'game', 'gameOver'
  const [tables, setTables] = useState(Array(10).fill({ players: [] }));
  const [currentTable, setCurrentTable] = useState(null);
  const [board, setBoard] = useState(Array(6).fill().map(() => Array(7).fill('')));
  const [currentPlayer, setCurrentPlayer] = useState('red');
  const [status, setStatus] = useState('Wachten op tegenstander...');
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    socket.on('tablesUpdate', (updatedTables) => {
      setTables(updatedTables);
    });

    socket.on('joinedTable', (table) => {
      setCurrentTable(table);
      if (table.players.length === 2) {
        setGameState('game');
        setStatus('Rode speler is aan de beurt');
      }
    });

    socket.on('gameUpdate', (updatedBoard, nextPlayer) => {
      setBoard(updatedBoard);
      setCurrentPlayer(nextPlayer);
      setStatus(`${nextPlayer === 'red' ? 'Rode' : 'Gele'} speler is aan de beurt`);
    });

    socket.on('gameOver', (winner) => {
      if (winner) {
        setStatus(`${winner === 'red' ? 'Rode' : 'Gele'} speler wint!`);
        setShowConfetti(true);
      } else {
        setStatus('Gelijkspel!');
      }
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
    if (gameState === 'game' && currentTable) {
      socket.emit('makeMove', currentTable.id, col);
    }
  };

  const playAgain = () => {
    if (currentTable) {
      socket.emit('playAgain', currentTable.id);
      setBoard(Array(6).fill().map(() => Array(7).fill('')));
      setCurrentPlayer('red');
      setStatus('Wachten op tegenstander...');
      setShowConfetti(false);
      setGameState('game');
    }
  };

  const renderNameEntry = () => (
    <GameWrapper>
      <h1 className="connect-four-title">Speel 4 op een rij online</h1>
      <form onSubmit={handleNameSubmit}>
        <input
          className="connect-four-input"
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Voer je naam in"
        />
        <Button type="submit">Start</Button>
      </form>
    </GameWrapper>
  );

  const renderLobby = () => (
    <GameWrapper>
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
                <Button onClick={() => joinTable(index)}>
                  Deelnemen
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </GameWrapper>
  );

  const renderGame = () => (
    <GameWrapper>
      {showConfetti && <Confetti />}
      <h2>4 op een Rij - Online spel</h2>
      <Board>
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <Cell
              key={`${rowIndex}-${colIndex}`}
              player={cell}
              onClick={() => makeMove(colIndex)}
            />
          ))
        )}
      </Board>
      <Status>{status}</Status>
      {gameState === 'gameOver' && <Button onClick={playAgain}>Nieuw spel</Button>}
    </GameWrapper>
  );

  return (
    <div>
      {gameState === 'enterName' && renderNameEntry()}
      {gameState === 'lobby' && renderLobby()}
      {(gameState === 'game' || gameState === 'gameOver') && renderGame()}
    </div>
  );
}

export default ConnectFourOnline;
