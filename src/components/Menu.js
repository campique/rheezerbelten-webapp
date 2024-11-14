import React, { useState } from 'react';
import styled from 'styled-components';
import { translations } from '../utils/translations';

const MenuWrapper = styled.div`
  display: grid;
  gap: 1rem;
  width: 100%;
  max-width: 300px;
  margin-bottom: 2rem;
`;

const OptionButton = styled.button`
  color: white;
  font-weight: bold;
  padding: 1rem 1.5rem;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  font-size: 1.4rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  transform: ${props => props.rotation};
  background-color: ${props => props.bgColor};

  &:hover {
    transform: scale(1.05) rotate(0deg);
    box-shadow: 0 6px 8px -2px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: scale(0.95) rotate(0deg);
  }

  &::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: rgba(255, 255, 255, 0.2);
    transform: rotate(45deg);
    transition: all 0.3s ease;
  }

  &:hover::after {
    left: 100%;
    top: 100%;
  }
`;

const GameItem = styled(OptionButton)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: auto;
  padding: 0.5rem 1rem;
`;

const GameEmoji = styled.span`
  font-size: 24px;
  margin-bottom: 5px;
`;

const GameTitle = styled.span`
  font-size: 16px;
`;

const Menu = ({ currentLanguage, navigateToPage }) => {
  const [showGames, setShowGames] = useState(false);

  const handleClick = (action) => {
    if (action === 'games') {
      setShowGames(!showGames);
    } else {
      navigateToPage(action);
    }
  };

  return (
    <MenuWrapper>
      {showGames ? (
        <>
          <GameItem 
            bgColor="#00c853" 
            rotation="rotate(-5deg)" 
            onClick={() => navigateToPage('/games/connect-four')}
          >
            <GameEmoji>🔴🟡</GameEmoji>
            <GameTitle>4 op een rij</GameTitle>
          </GameItem>
          <GameItem 
            bgColor="#ff4081" 
            rotation="rotate(5deg)" 
            onClick={() => navigateToPage('/games/pancake-dobble')}
          >
            <GameEmoji>🥞🔍</GameEmoji>
            <GameTitle>Pannenkoeken Dobble</GameTitle>
          </GameItem>
          <GameItem 
            bgColor="#2979ff" 
            rotation="rotate(-3deg)" 
            onClick={() => navigateToPage('/games/pictionary')}
          >
            <GameEmoji>🎨✏️</GameEmoji>
            <GameTitle>Pictionary</GameTitle>
          </GameItem>
          <OptionButton 
            bgColor="#ffd54f" 
            rotation="rotate(2deg)" 
            onClick={() => setShowGames(false)}
          >
            Terug
          </OptionButton>
        </>
      ) : (
        <>
          <OptionButton 
            bgColor="#00c853" 
            rotation="rotate(-5deg)" 
            onClick={() => handleClick('games')}
          >
            {translations[currentLanguage].games}
          </OptionButton>
          <OptionButton 
            bgColor="#ff4081" 
            rotation="rotate(5deg)" 
            onClick={() => handleClick('placemat')}
          >
            {translations[currentLanguage].placemat}
          </OptionButton>
          <OptionButton 
            bgColor="#2979ff" 
            rotation="rotate(-3deg)" 
            onClick={() => handleClick('chat')}
          >
            {translations[currentLanguage].chat}
          </OptionButton>
        </>
      )}
    </MenuWrapper>
  );
};

export default Menu;
