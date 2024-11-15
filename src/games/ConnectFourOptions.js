import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';

const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  background-color: #f0f0f0;
  min-height: 100vh;
`;

const OptionsList = styled.div`
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  width: 100%;
  max-width: 1200px;
`;

const OptionItem = styled.div`
  width: 200px;
  margin: 1rem;
  text-align: center;
  color: #333;
  background-color: white;
  border: 2px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  }
`;

const OptionEmoji = styled.span`
  font-size: 4rem;
`;

const OptionTitle = styled.h3`
  margin-top: 1rem;
`;

const BackButton = styled(Link)`
  margin-top: 2rem;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  background-color: #4CAF50;
  color: white;
  text-decoration: none;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #45a049;
  }
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

  return (
    <OptionsContainer>
      <h2>Kies een spelmodus</h2>
      <OptionsList>
        <OptionItem onClick={() => handleOption('vsKnof')}>
          <OptionEmoji>🤖</OptionEmoji>
          <OptionTitle>Speel tegen Knof</OptionTitle>
        </OptionItem>
        <OptionItem onClick={() => handleOption('vsLocal')}>
          <OptionEmoji>👥</OptionEmoji>
          <OptionTitle>Speel lokaal tegen een vriend</OptionTitle>
        </OptionItem>
        <OptionItem onClick={() => handleOption('vsOnline')}>
          <OptionEmoji>🌐</OptionEmoji>
          <OptionTitle>Speel online</OptionTitle>
        </OptionItem>
      </OptionsList>
      <BackButton to="/games">Terug naar spelletjes</BackButton>
    </OptionsContainer>
  );
};

export default ConnectFourOptions;
