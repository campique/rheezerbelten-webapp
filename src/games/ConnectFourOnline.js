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
    ${props => props.isWinning && `
      box-shadow: inset 0 0 0 4px #4CAF50;
    `}
    ${props => props.isLastWinning && `
      animation: pulse 0.5s ease-in-out infinite;
      box-shadow: inset 0 0 0 4px gold, 0 0 15px 7px gold;
    `}
  }

  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
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

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
    transform: none;
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
  const [winningCells, setWinningCells] = useState([]);
  const [lastWinningCell, setLastWinningCell] = useState(null);
  const [showRematchQuestion, setShowRematchQuestion] = useState(false);
  const [rematchVotes, setRematchVotes] = useState({ red: null, yellow: null });

  useEffect(() => {
    socket.on('tablesUpdate', (updatedTables) => {
      setTables(updatedTables);
      const currentPlayerTable = updatedTables.find(table => 
        table.players.some(player => player.id === socket.id)
      );
      if (!currentPlayerTable && gameState !== 'enterName') {
        resetGameState();
      }
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
      if (winner === 'draw') {
        setStatus('Gelijkspel!');
      } else {
        setStatus(`${players[winner]} wint!`);
        setWinningCells(winningLine || []);
        if (winningLine && winningLine.length > 0) {
          setLastWinningCell(winningLine[winningLine.length - 1]);
        }
        if (winner === playerColor) {
          setShowConfetti(true);
        }
        setScores(prev => ({ ...prev, [winner]: prev[winner] + 1 }));
      }
      setGameState('gameOver');
      setShowRematchQuestion(true);
    });

    socket.on('rematchAccepted', () => {
      startNewGame();
    });

    socket.on('returnToLobby', () => {
      returnToLobby();
    });

    socket.on('rematchVoteUpdate', (votes) => {
      setRematchVotes(votes);
      if (votes.red === false || votes.yellow === false) {
        returnToLobby();
      }
    });

    socket.on('opponentLeft', () => {
      setStatus('De andere speler heeft het spel verlaten');
      setGameState('opponentLeft');
    });

    socket.on('playerLeft', (playerId) => {
      if (playerId !== socket.id && gameState === 'game') {
        setStatus('De andere speler heeft het spel verlaten');
        setGameState('opponentLeft');
      }
    });

    return () => {
      socket.off('tablesUpdate');
      socket.off('joinedTable');
      socket.off('gameStart');
      socket.off('playerColor');
      socket.off('gameUpdate');
      socket.off('gameOver');
      socket.off('rematchAccepted');
      socket.off('returnToLobby');
      socket.off('rematchVoteUpdate');
      socket.off('opponentLeft');
      socket.off('playerLeft');
    };
  }, [gameState, players, playerColor]);

  useEffect(() => {
    const playerTable = tables.find(table => 
      table.players.some(player => player.id === socket.id)
    );
    setCurrentTable(playerTable || null);
  }, [tables]);

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (playerName.trim()) {
      socket.emit('setName', playerName);
      setGameState('lobby');
    }
  };

  const joinTable = (tableIndex) => {
    if (currentTable) {
      socket.emit('leaveTable', currentTable.id);
    }
    socket.emit('joinTable', tableIndex);
  };

  const makeMove = (col) => {
    if (gameState === 'game' && currentPlayer === playerColor) {
      socket.emit('makeMove', currentTable.id, col);
    }
  };

  const voteRematch = (vote) => {
    if (!vote) {
      socket.emit('rematchVote', currentTable.id, playerColor, false);
      returnToLobby();
    } else {
      socket.emit('rematchVote', currentTable.id, playerColor, true);
    }
  };

  const startNewGame = () => {
    setBoard(Array(6).fill().map(() => Array(7).fill('')));
    setStatus('Nieuw spel start...');
    setShowConfetti(false);
    setWinningCells([]);
    setLastWinningCell(null);
    setGameState('game');
    setShowRematchQuestion(false);
    setRematchVotes({ red: null, yellow: null });
  };

  const returnToLobby = () => {
    socket.emit('returnToLobby');
    resetGameState();
  };

  const resetGameState = () => {
    setCurrentTable(null);
    setBoard(Array(6).fill().map(() => Array(7).fill('')));
    setStatus('Wachten op tegenstander...');
    setShowConfetti(false);
    setWinningCells([]);
    setLastWinningCell(null);
    setScores({ red: 0, yellow: 0 });
    setPlayers({ red: '', yellow: '' });
    setGameState('lobby');
    setShowRematchQuestion(false);
    setRematchVotes({ red: null, yellow: null });
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
          className="connect-four-input"
        />
        <Button type="submit" className="connect-four-button">Start</Button>
      </NameEntryForm>
    </div>
  );

  const renderLobby = () => {
  return (
    <div className="lobby-container">
      <h2 className="connect-four-title">Kies een tafel</h2>
      <div className="tables-container">
        {tables.map((table, index) => {
          const randomRotation = Math.random() * 40 - 20;
          const randomTranslateX = Math.random() * 20 - 10;
          const randomTranslateY = Math.random() * 20 - 10;

          return (
            <div 
              key={index} 
              className="connect-four-table" 
              onClick={() => joinTable(index)}
              style={{
                transform: `rotate(${randomRotation}deg) translate(${randomTranslateX}px, ${randomTranslateY}px)`
              }}
            >
              <span className="table-name">Tafel {index + 1}</span>
              <div className="player-slots">
                <div className={`player-slot ${table.players[0] ? 'occupied' : ''}`}></div>
                <div className={`player-slot ${table.players[1] ? 'occupied' : ''}`}></div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="back-button-container">
        <Button onClick={() => setGameState('enterName')} className="connect-four-button">Terug</Button>
      </div>
    </div>
  );
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
              isCurrentPlayer={currentPlayer === playerColor && gameState === 'game'}
              isWinning={winningCells.some(([r, c]) => r === rowIndex && c === colIndex)}
              isLastWinning={lastWinningCell && lastWinningCell[0] === rowIndex && lastWinningCell[1] === colIndex}
            />
          ))
        )}
      </Board>
      <Status>{status}</Status>
      {gameState === 'opponentLeft' ? (
        <Button onClick={returnToLobby}>Terug naar lobby</Button>
      ) : showRematchQuestion ? (
        <div>
          <p>Wil je nog een keer spelen?</p>
          <Button onClick={() => voteRematch(true)} disabled={rematchVotes[playerColor] !== null}>Ja</Button>
          <Button onClick={() => voteRematch(false)} disabled={rematchVotes[playerColor] !== null}>Nee</Button>
          {rematchVotes[playerColor] === true && <p>Wachten op de andere speler...</p>}
        </div>
      ) : (
        gameState !== 'gameOver' && <Button onClick={returnToLobby}>Terug naar lobby</Button>
      )}
    </GameWrapper>
  );

  return (
    <GlobalStyle>
      {gameState === 'enterName' && renderNameEntry()}
      {gameState === 'lobby' && renderLobby()}
      {(gameState === 'game' || gameState === 'gameOver' || gameState === 'opponentLeft') && renderGame()}
    </GlobalStyle>
  );
}

export default ConnectFourOnline;
