import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
`;

const OptionButton = styled.div`
  background-color: ${props => props.bgColor};
  color: white;
  padding: 15px;
  margin: 10px;
  border-radius: 10px;
  cursor: pointer;
  transform: ${props => props.rotation};
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 160px;
  height: 80px;

  &:hover {
    transform: scale(1.05) ${props => props.rotation};
  }
`;

const GameEmoji = styled.span`
  font-size: 1.5rem;
  margin-bottom: 5px;
`;

const GameTitle = styled.span`
  font-size: 1rem;
  text-align: center;
`;

const ConnectFourOptions = () => {
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

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <OptionsContainer>
      <OptionButton 
        bgColor="#00c853" 
        rotation="rotate(-5deg)" 
        onClick={() => handleOption('vsKnof')}
      >
        <GameEmoji>🤖</GameEmoji>
        <GameTitle>Speel tegen Knof</GameTitle>
      </OptionButton>
      <OptionButton 
        bgColor="#ff4081" 
        rotation="rotate(5deg)" 
        onClick={() => handleOption('vsLocal')}
      >
        <GameEmoji>👥</GameEmoji>
        <GameTitle>Speel lokaal</GameTitle>
      </OptionButton>
      <OptionButton 
        bgColor="#2979ff" 
        rotation="rotate(-3deg)" 
        onClick={() => handleOption('vsOnline')}
      >
        <GameEmoji>🌐</GameEmoji>
        <GameTitle>Speel online</GameTitle>
      </OptionButton>
      <OptionButton 
        bgColor="#ffd54f" 
        rotation="rotate(2deg)" 
        onClick={handleBack}
      >
        <GameEmoji>↩️</GameEmoji>
        <GameTitle>Terug</GameTitle>
      </OptionButton>
    </OptionsContainer>
  );
};

export default ConnectFourOptions;
