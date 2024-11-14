import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const OptionsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
`;

const OptionButton = styled.button`
  background-color: #4CAF50;
  border: none;
  color: white;
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  cursor: pointer;
  border-radius: 12px;
  transition: all 0.3s ease;

  &:hover {
    background-color: #45a049;
    transform: scale(1.05);
  }
`;

const Title = styled.h2`
  color: #333;
  margin-bottom: 1rem;
`;

const translations = {
  nl: {
    title: "Kies een spelmodus",
    vsKnof: "Speel tegen Knof",
    vsLocal: "Speel lokaal tegen een vriend",
    vsOnline: "Speel online"
  },
  de: {
    title: "Wähle einen Spielmodus",
    vsKnof: "Spiele gegen Knof",
    vsLocal: "Spiele lokal gegen einen Freund",
    vsOnline: "Spiele online"
  }
};

const ConnectFourOptions = ({ currentLanguage }) => {
  const navigate = useNavigate();

  const handleOption = (option) => {
    switch(option) {
      case 'vsKnof':
        navigate('/games/connect-four/vs-knof');
        break;
      case 'vsLocal':
        navigate('/games/connect-four/local');
        break;
      case 'vsOnline':
        navigate('/games/connect-four/online');
        break;
      default:
        break;
    }
  };

  return (
    <OptionsWrapper>
      <Title>{translations[currentLanguage].title}</Title>
      <OptionButton onClick={() => handleOption('vsKnof')}>
        {translations[currentLanguage].vsKnof}
      </OptionButton>
      <OptionButton onClick={() => handleOption('vsLocal')}>
        {translations[currentLanguage].vsLocal}
      </OptionButton>
      <OptionButton onClick={() => handleOption('vsOnline')}>
        {translations[currentLanguage].vsOnline}
      </OptionButton>
    </OptionsWrapper>
  );
};

export default ConnectFourOptions;
