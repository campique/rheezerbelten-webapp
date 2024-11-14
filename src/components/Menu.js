import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const MenuWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const MenuItem = styled(Link)`
  margin: 10px;
  padding: 10px 20px;
  background-color: #f0f0f0;
  border-radius: 5px;
  text-decoration: none;
  color: #333;
`;

const GameItem = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 10px;
  padding: 10px;
  background-color: #f0f0f0;
  border-radius: 5px;
  text-decoration: none;
  color: #333;
`;

const GameEmoji = styled.span`
  font-size: 24px;
  margin-bottom: 5px;
`;

const GameTitle = styled.span`
  font-size: 16px;
`;

function Menu({ currentLanguage, navigateToPage }) {
  const [showGames, setShowGames] = useState(false);

  const handleGamesClick = () => {
    setShowGames(!showGames);
  };

  if (showGames) {
    return (
      <MenuWrapper>
        <GameItem to="/games/connect-four">
          <GameEmoji>🔴🟡</GameEmoji>
          <GameTitle>4 op een rij</GameTitle>
        </GameItem>
        <GameItem to="/games/pancake-dobble">
          <GameEmoji>🥞🔍</GameEmoji>
          <GameTitle>Pannenkoeken Dobble</GameTitle>
        </GameItem>
        <GameItem to="/games/pictionary">
          <GameEmoji>🎨✏️</GameEmoji>
          <GameTitle>Pictionary</GameTitle>
        </GameItem>
        <MenuItem onClick={() => setShowGames(false)}>Terug</MenuItem>
      </MenuWrapper>
    );
  }

  return (
    <MenuWrapper>
      <MenuItem onClick={handleGamesClick}>Spelletjes</MenuItem>
      <MenuItem to="/placemat">Interactieve Placemat</MenuItem>
      <MenuItem to="/chat">Praten met Knof</MenuItem>
    </MenuWrapper>
  );
}

export default Menu;
