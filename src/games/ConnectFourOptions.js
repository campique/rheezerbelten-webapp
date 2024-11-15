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

const BackButton = styled.button`
  margin-top: 2rem;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #1E88E5;
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
    navigate(-1); // This will navigate back to the previous page
  };

  return (
    <OptionsWrapper>
      <Title>Kies een spelmodus</Title>
      <OptionButton onClick={() => handleOption('vsKnof')}>
        Speel tegen Knof
      </OptionButton>
      <OptionButton onClick={() => handleOption('vsLocal')}>
        Speel lokaal tegen een vriend
      </OptionButton>
      <OptionButton onClick={() => handleOption('vsOnline')}>
        Speel online
      </OptionButton>
      <BackButton onClick={handleBack}>Terug</BackButton>
    </OptionsWrapper>
  );
};

export default ConnectFourOptions;
