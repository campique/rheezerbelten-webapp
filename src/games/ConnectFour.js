import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import io from 'socket.io-client';

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

const ConnectFour = () => {
  const [socket, setSocket] = useState(null);
  const [gameState, setGameState] = useState(Array(6).fill().map(() => Array(7).fill('')));
  const [currentPlayer, setCurrentPlayer] = useState('');
  const [gameActive, setGameActive] = useState(false);
  const [status, setStatus] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [showLobby, setShowLobby] = useState(true);
  const [tables, setTables] = useState([]);

  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_SOCKET_URL || 'https://your-heroku-app.herokuapp.com');
    setSocket(newSocket);

    newSocket.on('tablesUpdate', (updatedTables) => {
      setTables(updatedTables);
    });

    newSocket.on('joinedTable', ({ playerId, opponentName }) => {
      setCurrentPlayer(playerId);
      setShowLobby(false);
    });

    newSocket.on('gameStarted', (game) => {
      setGameState(game.board);
      setCurrentPlayer(game.currentPlayer);
      setGameActive(true);
      setStatus(`${game.currentPlayer === 'red' ? 'Jouw' : 'Tegenstander\'s'} beurt`);
    });

    newSocket.on('gameUpdated', (game) => {
      setGameState(game.board);
      setCurrentPlayer(game.currentPlayer);
      setStatus(`${game.currentPlayer === 'red' ? 'Jouw' : 'Tegenstander\'s'} beurt`);
    });

    newSocket.on('gameOver', ({ winner }) => {
      setGameActive(false);
      setStatus(winner === 'draw' ? 'Gelijkspel!' : winner === currentPlayer ? 'Jij wint!' : 'Tegenstander wint!');
    });

    newSocket.on('askRematch', () => {
      // Implement rematch logic here
    });

    newSocket.on('returnToLobby', () => {
      setShowLobby(true);
      setGameState(Array(6).fill().map(() => Array(7).fill('')));
      setGameActive(false);
      setStatus('');
    });

    return () => newSocket.close();
  }, []);

  const handleCellClick = (col) => {
    if (!gameActive || currentPlayer !== 'red') return;
    socket.emit('makeMove', { tableId: 0, col });
  };

  const handleSetName = () => {
    if (playerName.trim()) {
      socket.emit('setName', playerName);
      socket.emit('getTables');
    }
  };

  const handleJoinTable = (tableIndex) => {
    socket.emit('joinTable', tableIndex);
  };

  const handleLeaveTable = () => {
    socket.emit('leaveTable', 0);
    setShowLobby(true);
  };

  if (showLobby) {
    return (
      <GameWrapper>
        <h2>4 op een Rij - Lobby</h2>
        {playerName ? (
          <>
            <div>Beschikbare tafels:</div>
            {tables.map((table, index) => (
              <Button key={index} onClick={() => handleJoinTable(index)}>
                Tafel {index + 1}: {table.players}/2 spelers
              </Button>
            ))}
          </>
        ) : (
          <>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Voer je naam in"
            />
            <Button onClick={handleSetName}>Start</Button>
          </>
        )}
      </GameWrapper>
    );
  }

  return (
    <GameWrapper>
      <h2>4 op een Rij</h2>
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
      <Button onClick={handleLeaveTable}>Verlaat tafel</Button>
    </GameWrapper>
  );
};

export default ConnectFour;
