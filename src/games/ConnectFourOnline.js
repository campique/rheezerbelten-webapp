import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io(process.env.REACT_APP_SERVER_URL || '');

const ConnectFourOnline = () => {
  const [playerName, setPlayerName] = useState('');
  const [gameState, setGameState] = useState('enterName'); // 'enterName', 'lobby', 'game', 'gameOver'
  const [tables, setTables] = useState(Array(10).fill({ players: [] }));
  const [currentTable, setCurrentTable] = useState(null);
  const [board, setBoard] = useState(Array(6).fill().map(() => Array(7).fill(null)));
  const [currentPlayer, setCurrentPlayer] = useState('red');
  const [scores, setScores] = useState({ red: 0, yellow: 0 });
  const [winner, setWinner] = useState(null);

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

    socket.on('gameUpdate', (updatedBoard, nextPlayer) => {
      setBoard(updatedBoard);
      setCurrentPlayer(nextPlayer);
    });

    socket.on('gameOver', (winner, updatedScores) => {
      setWinner(winner);
      setScores(updatedScores);
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
    socket.emit('makeMove', currentTable.id, col);
  };

  const playAgain = (choice) => {
    socket.emit('playAgain', currentTable.id, choice);
    if (!choice) {
      setGameState('lobby');
      setCurrentTable(null);
    }
  };

  const renderNameEntry = () => (
    <form onSubmit={handleNameSubmit}>
      <input
        type="text"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        placeholder="Voer je naam in"
      />
      <button type="submit">Ga naar Lobby</button>
    </form>
  );

  const renderLobby = () => (
    <div>
      <h2>Lobby</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
        {tables.map((table, index) => (
          <div key={index} style={{ border: '1px solid black', padding: '10px' }}>
            <h3>Tafel {index + 1}</h3>
            {table.players.map((player, i) => (
              <p key={i}>{player.name}</p>
            ))}
            {table.players.length < 2 && (
              <button onClick={() => joinTable(index)}>Deelnemen</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderGame = () => (
    <div>
      <h2>Connect Four</h2>
      <div>Huidige Speler: {currentPlayer}</div>
      <div>Scores: Rood {scores.red} - {scores.yellow} Geel</div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {board.map((row, rowIndex) => (
          <div key={rowIndex} style={{ display: 'flex' }}>
            {row.map((cell, colIndex) => (
              <div
                key={colIndex}
                onClick={() => makeMove(colIndex)}
                style={{
                  width: 50,
                  height: 50,
                  border: '1px solid black',
                  backgroundColor: cell || 'white',
                  cursor: 'pointer'
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  const renderGameOver = () => (
    <div>
      <h2>Spel Afgelopen</h2>
      <p>{winner ? `Winnaar: ${winner}` : 'Gelijkspel!'}</p>
      <p>Scores: Rood {scores.red} - {scores.yellow} Geel</p>
      <p>Nog een potje spelen?</p>
      <button onClick={() => playAgain(true)}>Ja</button>
      <button onClick={() => playAgain(false)}>Nee</button>
    </div>
  );

  return (
    <div>
      <h1>Connect Four Online</h1>
      {gameState === 'enterName' && renderNameEntry()}
      {gameState === 'lobby' && renderLobby()}
      {gameState === 'game' && renderGame()}
      {gameState === 'gameOver' && renderGameOver()}
    </div>
  );
};

export default ConnectFourOnline;
