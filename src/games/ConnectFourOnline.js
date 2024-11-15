import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './ConnectFour.css';

const socket = io('http://localhost:3001');

// Eenvoudige vertaalfunctie
const translate = (key, language) => {
  const translations = {
    'Speel 4 op een rij online': {
      nl: 'Speel 4 op een rij online',
      en: 'Play Connect Four online',
      de: 'Spiele 4 Gewinnt online'
    },
    'Voer je naam in': {
      nl: 'Voer je naam in',
      en: 'Enter your name',
      de: 'Gib deinen Namen ein'
    },
    'Start': {
      nl: 'Start',
      en: 'Start',
      de: 'Start'
    },
    'Beschikbare tafels': {
      nl: 'Beschikbare tafels',
      en: 'Available tables',
      de: 'Verfügbare Tische'
    },
    'Tafel': {
      nl: 'Tafel',
      en: 'Table',
      de: 'Tisch'
    },
    'spelers': {
      nl: 'spelers',
      en: 'players',
      de: 'Spieler'
    },
    'Deelnemen': {
      nl: 'Deelnemen',
      en: 'Join',
      de: 'Beitreten'
    },
    'Gelijkspel!': {
      nl: 'Gelijkspel!',
      en: 'Draw!',
      de: 'Unentschieden!'
    },
    'Winnaar': {
      nl: 'Winnaar',
      en: 'Winner',
      de: 'Gewinner'
    },
    'Huidige speler': {
      nl: 'Huidige speler',
      en: 'Current player',
      de: 'Aktueller Spieler'
    },
    'Rood': {
      nl: 'Rood',
      en: 'Red',
      de: 'Rot'
    },
    'Geel': {
      nl: 'Geel',
      en: 'Yellow',
      de: 'Gelb'
    },
    'Opnieuw spelen': {
      nl: 'Opnieuw spelen',
      en: 'Play again',
      de: 'Nochmal spielen'
    },
    'Terug naar lobby': {
      nl: 'Terug naar lobby',
      en: 'Back to lobby',
      de: 'Zurück zur Lobby'
    }
  };

  return translations[key][language] || key;
};

function ConnectFourOnline() {
  const [language, setLanguage] = useState('nl'); // Standaardtaal
  const t = (key) => translate(key, language);

  const [playerName, setPlayerName] = useState('');
  const [showLobby, setShowLobby] = useState(false);
  const [tables, setTables] = useState([]);
  const [currentTable, setCurrentTable] = useState(null);
  const [board, setBoard] = useState(Array(6).fill().map(() => Array(7).fill(null)));
  const [currentPlayer, setCurrentPlayer] = useState('red');
  const [winner, setWinner] = useState(null);
  const [scores, setScores] = useState({ red: 0, yellow: 0 });

  useEffect(() => {
    socket.on('tablesUpdate', (updatedTables) => {
      setTables(updatedTables);
    });

    socket.on('joinedTable', (table) => {
      setCurrentTable(table);
      setShowLobby(false);
    });

    socket.on('gameUpdate', (updatedBoard, nextPlayer) => {
      setBoard(updatedBoard);
      setCurrentPlayer(nextPlayer);
    });

    socket.on('gameOver', (winningPlayer, updatedScores) => {
      setWinner(winningPlayer);
      setScores(updatedScores);
    });

    return () => {
      socket.off('tablesUpdate');
      socket.off('joinedTable');
      socket.off('gameUpdate');
      socket.off('gameOver');
    };
  }, []);

  const handleSetName = () => {
    if (playerName.trim()) {
      socket.emit('setName', playerName);
      setShowLobby(true);
    }
  };

  const handleJoinTable = (tableIndex) => {
    socket.emit('joinTable', tableIndex);
  };

  const handleCellClick = (col) => {
    if (currentTable && !winner) {
      socket.emit('makeMove', currentTable.id, col);
    }
  };

  const handlePlayAgain = (choice) => {
    socket.emit('playAgain', currentTable.id, choice);
    if (!choice) {
      setCurrentTable(null);
      setShowLobby(true);
      setWinner(null);
      setBoard(Array(6).fill().map(() => Array(7).fill(null)));
    }
  };

  if (!showLobby && !currentTable) {
    return (
      <div className="connect-four-container">
        <h1 className="connect-four-title">{t('Speel 4 op een rij online')}</h1>
        <input
          className="connect-four-input"
          type="text"
          placeholder={t('Voer je naam in')}
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
        />
        <button className="connect-four-button" onClick={handleSetName}>
          {t('Start')}
        </button>
      </div>
    );
  }

  if (showLobby) {
    return (
      <div className="connect-four-container">
        <h2 className="connect-four-title">{t('Beschikbare tafels')}</h2>
        <div className="connect-four-lobby">
          {tables.map((table, index) => (
            <div key={index} className="connect-four-table">
              <span>{t('Tafel')} {index + 1}</span>
              <span>{table.players.length}/2 {t('spelers')}</span>
              <button
                className="connect-four-button"
                onClick={() => handleJoinTable(index)}
                disabled={table.players.length === 2}
              >
                {t('Deelnemen')}
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="connect-four">
      <div className="status">
        {winner
          ? winner === 'draw'
            ? t('Gelijkspel!')
            : `${t('Winnaar')}: ${winner}`
          : `${t('Huidige speler')}: ${currentPlayer}`}
      </div>
      <div className="scoreboard">
        {t('Rood')}: {scores.red} - {t('Geel')}: {scores.yellow}
      </div>
      <div className="board">
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`cell ${cell || ''}`}
              onClick={() => handleCellClick(colIndex)}
            />
          ))
        )}
      </div>
      {winner && (
        <div className="rematch-section">
          <button onClick={() => handlePlayAgain(true)}>{t('Opnieuw spelen')}</button>
          <button onClick={() => handlePlayAgain(false)}>{t('Terug naar lobby')}</button>
        </div>
      )}
    </div>
  );
}

export default ConnectFourOnline;
