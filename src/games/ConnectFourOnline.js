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

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
    &:hover {
      transform: none;
      box-shadow: none;
    }
  }
`;

const ConnectFourOnline = () => {
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [tables, setTables] = useState([]);
  const [gameState, setGameState] = useState(null);
  const [tableId, setTableId] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [opponentName, setOpponentName] = useState('');
  const [status, setStatus] = useState('Verbinden met server...');
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const socketUrl = process.env.NODE_ENV === 'production' 
      ? 'https://rheezerbelten-webapp.herokuapp.com' 
      : 'http://localhost:3000';

    const newSocket = io(socketUrl);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setStatus('Verbonden. Voer je naam in.');
      const playerName = prompt("Voer je naam in:");
      if (playerName) {
        newSocket.emit('setName', playerName);
      }
    });

    newSocket.on('tablesUpdate', (updatedTables) => {
      console.log('Received tables update:', updatedTables);
      setTables(updatedTables);
      setStatus('Kies een tafel om mee te doen');
    });

    newSocket.on('joinedTable', ({ tableId, playerId, opponentName }) => {
      console.log(`Joined table ${tableId} as ${playerId}`);
      setTableId(tableId);
      setPlayerId(playerId);
      setOpponentName(opponentName);
      setStatus(opponentName ? 'Spel start...' : 'Wachten op tegenstander...');
    });

    newSocket.on('gameStarted', (initialGameState) => {
      console.log('Game started:', initialGameState);
      setGameState(initialGameState);
      setStatus(`${initialGameState.currentPlayer === playerId ? 'Jouw' : 'Tegenstander\'s'} beurt`);
    });

    newSocket.on('gameUpdated', (updatedGameState) => {
      console.log('Game updated:', updatedGameState);
      setGameState(updatedGameState);
      setStatus(`${updatedGameState.currentPlayer === playerId ? 'Jouw' : 'Tegenstander\'s'} beurt`);
    });

    newSocket.on('gameOver', ({ winner }) => {
      console.log('Game over, winner:', winner);
      if (winner === 'draw') {
        setStatus('Gelijkspel!');
      } else {
        setStatus(winner === playerId ? 'Je hebt gewonnen!' : 'Je hebt verloren.');
        if (winner === playerId) setShowConfetti(true);
      }
    });

    newSocket.on('askRematch', () => {
      const wantRematch = window.confirm('Wil je nog een keer spelen?');
      newSocket.emit('rematchVote', { tableId, vote: wantRematch });
    });

    newSocket.on('opponentLeft', () => {
      console.log('Opponent left');
      setStatus('Tegenstander heeft het spel verlaten.');
      setOpponentName('');
      setGameState(null);
    });

    newSocket.on('returnToLobby', () => {
      console.log('Returning to lobby');
      setTableId(null);
      setPlayerId(null);
      setOpponentName('');
      setGameState(null);
      setStatus('Kies een tafel om mee te doen');
      newSocket.emit('getTables');
    });

    newSocket.on('tableJoinError', (errorMessage) => {
      console.log('Table join error:', errorMessage);
      setStatus(errorMessage);
    });

    return () => newSocket.close();
  }, []);

  const joinTable = (tableIndex) => {
    console.log('Attempting to join table:', tableIndex);
    socket.emit('joinTable', tableIndex);
  };

  const handleCellClick = (col) => {
    if (gameState && gameState.currentPlayer === playerId) {
      console.log('Making move on column:', col);
      socket.emit('makeMove', { tableId, col });
    }
  };

  const leaveTable = () => {
    if (tableId !== null) {
      console.log('Leaving table:', tableId);
      socket.emit('leaveTable', tableId);
      setTableId(null);
      setPlayerId(null);
      setOpponentName('');
      setGameState(null);
      setStatus('Kies een tafel om mee te doen');
    }
  };

  return (
    <GameWrapper>
      {showConfetti && <Confetti />}
      <h2>4 op een Rij - Online spel</h2>
      <Status>{status}</Status>
      {!tableId && (
        <div>
          {tables.map((table, index) => (
            <Button key={index} onClick={() => joinTable(index)} disabled={table.players === 2}>
              Tafel {index + 1} ({table.players}/2 spelers)
            </Button>
          ))}
        </div>
      )}
      {gameState && (
        <Board>
          {gameState.board.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <Cell
                key={`${rowIndex}-${colIndex}`}
                player={cell}
                onClick={() => handleCellClick(colIndex)}
              />
            ))
          )}
        </Board>
      )}
      {tableId !== null && <Button onClick={leaveTable}>Verlaat tafel</Button>}
      <Button onClick={() => navigate('/games/connect-four')}>Terug naar opties</Button>
    </GameWrapper>
  );
};

export default ConnectFourOnline;
