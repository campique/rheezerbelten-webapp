import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import io from 'socket.io-client';

const GameWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
`;

const Input = styled.input`
  margin: 10px;
  padding: 5px;
  font-size: 18px;
`;

const Button = styled.button`
  margin: 10px;
  padding: 10px 20px;
  font-size: 18px;
  cursor: pointer;
`;

const Status = styled.div`
  margin: 20px 0;
  font-size: 24px;
  font-weight: bold;
`;

const ConnectFourOnline = () => {
  const [socket, setSocket] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [status, setStatus] = useState('Wachten op naam...');

  useEffect(() => {
    console.log('Connecting to socket...');
    const newSocket = io(window.location.origin);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setStatus('Verbonden met server. Voer je naam in.');
    });

    return () => newSocket.close();
  }, []);

  const joinGame = () => {
    if (playerName.trim() !== '' && socket) {
      console.log('Joining game with name:', playerName);
      socket.emit('joinGame', { name: playerName });
      setStatus('Wachten op tegenstander...');
    }
  };

  return (
    <GameWrapper>
      <h2>4 op een Rij - Lobby</h2>
      <Input 
        type="text" 
        placeholder="Voer je naam in" 
        value={playerName} 
        onChange={(e) => setPlayerName(e.target.value)}
      />
      <Button onClick={joinGame}>Spel Starten</Button>
      <Status>{status}</Status>
    </GameWrapper>
  );
};

export default ConnectFourOnline;
