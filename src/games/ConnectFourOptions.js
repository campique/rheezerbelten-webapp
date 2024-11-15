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
  padding: 15px 20px;
  margin: 10px;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  width: 250px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  transform: ${props => props.rotation};

  &:before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: rgba(255, 255, 255, 0.1);
    transform: rotate(45deg);
  }

  &:hover {
    transform: scale(1.05) ${props => props.hoverRotation};
  }
`;

const GameEmoji = styled.span`
  font-size: 2rem;
  margin-right: 15px;
`;

const GameTitle = styled.span`
  font-size: 1.2rem;
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
        hoverRotation="rotate(0deg)"
        onClick={() => handleOption('vsKnof')}
      >
        <GameEmoji>🤖</GameEmoji>
        <GameTitle>Speel tegen Knof</GameTitle>
      </OptionButton>
      <OptionButton 
        bgColor="#ff4081" 
        rotation="rotate(5deg)"
        hoverRotation="rotate(0deg)"
        onClick={() => handleOption('vsLocal')}
      >
        <GameEmoji>👥</GameEmoji>
        <GameTitle>Speel lokaal</GameTitle>
      </OptionButton>
      <OptionButton 
        bgColor="#2979ff" 
        rotation="rotate(-3deg)"
        hoverRotation="rotate(2deg)"
        onClick={() => handleOption('vsOnline')}
      >
        <GameEmoji>🌐</GameEmoji>
        <GameTitle>Speel online</GameTitle>
      </OptionButton>
      <OptionButton 
        bgColor="#ffd54f" 
        rotation="rotate(2deg)"
        hoverRotation="rotate(-3deg)"
        onClick={handleBack}
      >
        <GameEmoji>↩️</GameEmoji>
        <GameTitle>Terug</GameTitle>
      </OptionButton>
    </OptionsContainer>
  );
};

export default ConnectFourOptions;
