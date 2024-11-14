import React, { useState } from 'react';
import styled from 'styled-components';
import Games from './Games';

const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f0f0f0;
`;

const Button = styled.button`
  margin: 10px;
  padding: 15px 30px;
  font-size: 18px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #45a049;
  }
`;

const Home = () => {
  const [showGames, setShowGames] = useState(false);

  const handleGamesClick = () => {
    setShowGames(true);
  };

  const handleBackClick = () => {
    setShowGames(false);
  };

  if (showGames) {
    return <Games onBack={handleBackClick} />;
  }

  return (
    <HomeContainer>
      <Button onClick={handleGamesClick}>Spelletjes</Button>
      <Button>Interactieve Placemat</Button>
      <Button>Praten met Knof</Button>
    </HomeContainer>
  );
};

export default Home;
