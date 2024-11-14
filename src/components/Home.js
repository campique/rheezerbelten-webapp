import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f0f0f0;
`;

const Button = styled(Link)`
  margin: 10px;
  padding: 15px 30px;
  font-size: 18px;
  background-color: #4CAF50;
  color: white;
  text-decoration: none;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #45a049;
  }
`;

const Home = () => {
  return (
    <HomeContainer>
      <Button to="/games">Spelletjes</Button>
      <Button to="/placemat">Interactieve Placemat</Button>
      <Button to="/knof">Praten met Knof</Button>
    </HomeContainer>
  );
};

export default Home;
