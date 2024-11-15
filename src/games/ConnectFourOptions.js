import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f0f0f0;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #333;
`;

const Button = styled.button`
  background-color: #4CAF50;
  border: none;
  color: white;
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 10px;
  cursor: pointer;
  border-radius: 12px;
  transition: all 0.3s ease;

  &:hover {
    background-color: #45a049;
    transform: scale(1.05);
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

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <OptionsContainer>
      <Title>Kies een spelmodus</Title>
      <Button onClick={() => handleOption('vsKnof')}>
        Speel tegen Knof
      </Button>
      <Button onClick={() => handleOption('vsLocal')}>
        Speel lokaal tegen een vriend
      </Button>
      <Button onClick={() => handleOption('vsOnline')}>
        Speel online
      </Button>
      <Button onClick={handleBack}>Terug naar spelletjes</Button>
    </OptionsContainer>
  );
};

export default ConnectFourOptions;
