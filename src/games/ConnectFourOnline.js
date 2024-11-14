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
  }
`;

const Input = styled.input`
  padding: 0.5rem;
  margin: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
`;

const ConnectFourOnline = () => {
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [inLobby, setInLobby] = useState(false);
  const [tables, setTables] = useState([]);
  const [currentTable, setCurrentTable] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [status, setStatus] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const serverURL = process.env.REACT_APP_SERVER_URL || 'http://localhost:3001';
    const newSocket = io(serverURL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setStatus('Verbindingsfout. Probeer de pagina te verversen.');
    });

    newSocket.on('lobbyUpdate', (updatedTables) => {
      console.log('Received lobby update:', updatedTables);
      setTables(updatedTables);
    });

    newSocket.on('gameStart', (initialGameState) => {
      console.log('Game started:', initialGameState);
      setCurrentTable(initialGameState.tableId);
      setGameState(initialGameState.board);
      setCurrentPlayer(initialGameState.currentPlayer);
      setStatus(`${initialGameState.currentPlayer === 'red' ? 'Rode' : 'Gele'} speler is aan de beurt`);
      setInLobby(false);
    });

    newSocket.on('gameUpdate', (updatedGameState) => {
      console.log('Game updated:', updatedGameState);
      setGameState(updatedGameState.board);
      setCurrentPlayer(updatedGameState.currentPlayer);
      setStatus(`${updatedGameState.currentPlayer === 'red' ? 'Rode' : 'Gele'} speler is aan de beurt`);
    });

    newSocket.on('gameOver', ({ winner }) => {
      console.log('Game over, winner:', winner);
      if (winner === 'draw') {
        setStatus('Gelijkspel!');
      } else {
        setStatus(`${winner === 'red' ? 'Rode' : 'Gele'} speler wint!`);
        setShowConfetti(true);
      }
      setTimeout(() => {
        const playAgain = window.confirm('Wil je nog een keer spelen?');
        newSocket.emit('playAgainVote', { tableId: currentTable, vote: playAgain });
      }, 1000);
    });

    newSocket.on('returnToLobby', () => {
      console.log('Returning to lobby');
      setInLobby(true);
      setCurrentTable(null);
      setGameState(null);
      setCurrentPlayer(null);
      setStatus('');
      setShowConfetti(false);
    });

    return () => newSocket.close();
  }, []);

  const enterLobby = () => {
    if (playerName && socket) {
      console.log('Entering lobby with name:', playerName);
      socket.emit('enterLobby', playerName);
      setInLobby(true);
    }
  };

  const joinTable = (tableId) => {
    if (socket) {
      console.log('Joining table:', tableId);
      socket.emit('joinTable', tableId);
    }
  };

  const handleCellClick = (col) => {
    if (gameState && currentPlayer && socket) {
      console.log('Making move on column:', col);
      socket.emit('makeMove', { tableId: currentTable, column: col });
    }
  };

  if (!inLobby && !currentTable) {
    return (
      <GameWrapper>
        <h2>4 op een Rij - Online spel</h2>
        <Input 
          type="text" 
          value={playerName} 
          onChange={(e) => setPlayerName(e.target.value)} 
          placeholder="Voer je naam in"
        />
        <Button onClick={enterLobby}>Speel online</Button>
        <Button onClick={() => navigate('/games/connect-four')}>Terug naar opties</Button>
      </GameWrapper>
    );
  }

  if (inLobby) {
    return (
      <GameWrapper>
        <h2>Lobby</h2>
        {tables.map((table) => (
          <Button key={table.id} onClick={() => joinTable(table.id)} disabled={table.players.length === 2}>
            Tafel {table.id} ({table.players.length}/2)
          </Button>
        ))}
        <Button onClick={() => navigate('/games/connect-four')}>Terug naar opties</Button>
      </GameWrapper>
    );
  }

  if (gameState) {
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
        <Button onClick={() => navigate('/games/connect-four')}>Terug naar opties</Button>
      </GameWrapper>
    );
  }

  return (
    <GameWrapper>
      <h2>4 op een Rij - Online spel</h2>
      <Status>Laden...</Status>
      <Button onClick={() => navigate('/games/connect-four')}>Terug naar opties</Button>
    </GameWrapper>
  );
};

export default ConnectFourOnline;
