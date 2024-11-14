import React, { useState } from 'react';
import styled from 'styled-components';

const MenuWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f0f0f0;
`;

const OptionButton = styled.button`
  background-color: ${props => props.bgColor};
  color: white;
  font-size: 24px;
  padding: 15px 30px;
  margin: 10px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transform: ${props => props.rotation};
  transition: all 0.3s ease;

  &:hover {
    transform: ${props => props.rotation} scale(1.1);
  }
`;

const GameItem = styled(OptionButton)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 200px;
  height: 200px;
`;

const GameEmoji = styled.span`
  font-size: 48px;
  margin-bottom: 10px;
`;

const GameTitle = styled.span`
  font-size: 18px;
  text-align: center;
`;

const translations = {
  nl: {
    connectFour: "4 op een rij",
    pancakeDobble: "Pannenkoeken Dobble",
    pictionary: "Pictionary",
    back: "Terug",
    games: "Spelletjes",
    placemat: "Placemat",
    chat: "Chat"
  },
  de: {
    connectFour: "Vier gewinnt",
    pancakeDobble: "Pfannkuchen Dobble",
    pictionary: "Montagsmaler",
    back: "Zurück",
    games: "Spiele",
    placemat: "Tischset",
    chat: "Chat"
  }
};

const Menu = ({ currentLanguage, navigateToPage }) => {
  const [showGames, setShowGames] = useState(false);

  const handleClick = (action) => {
    if (action === 'games') {
      setShowGames(!showGames);
    } else {
      navigateToPage(action);
    }
  };

  if (showGames) {
    return (
      <MenuWrapper>
        <GameItem 
          bgColor="#00c853" 
          rotation="rotate(-5deg)" 
          onClick={() => navigateToPage('/games/connect-four')}
        >
          <GameEmoji>🔴🟡</GameEmoji>
          <GameTitle>{translations[currentLanguage].connectFour}</GameTitle>
        </GameItem>
        <GameItem 
          bgColor="#ff4081" 
          rotation="rotate(5deg)" 
          onClick={() => navigateToPage('/games/pancake-dobble')}
        >
          <GameEmoji>🥞🔍</GameEmoji>
          <GameTitle>{translations[currentLanguage].pancakeDobble}</GameTitle>
        </GameItem>
        <GameItem 
          bgColor="#2979ff" 
          rotation="rotate(-3deg)" 
          onClick={() => navigateToPage('/games/pictionary')}
        >
          <GameEmoji>🎨✏️</GameEmoji>
          <GameTitle>{translations[currentLanguage].pictionary}</GameTitle>
        </GameItem>
        <OptionButton 
          bgColor="#ffd54f" 
          rotation="rotate(2deg)" 
          onClick={() => setShowGames(false)}
        >
          {translations[currentLanguage].back}
        </OptionButton>
      </MenuWrapper>
    );
  }

  return (
    <MenuWrapper>
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
    </MenuWrapper>
  );
};

export default Menu;
