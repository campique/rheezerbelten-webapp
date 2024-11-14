import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const GamesContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
`;

const GamesList = styled.div`
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  width: 100%;
  max-width: 1200px;
`;

const GameItem = styled(Link)`
  width: 200px;
  margin: 1rem;
  text-align: center;
  text-decoration: none;
  color: #333;
  border: 2px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  }
`;

const GameEmoji = styled.span`
  font-size: 4rem;
`;

const GameTitle = styled.h3`
  margin-top: 1rem;
`;

const Games = () => {
  return (
    <GamesContainer>
      <h2>Spelletjes</h2>
      <GamesList>
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
      </GamesList>
    </GamesContainer>
  );
};

export default Games;
