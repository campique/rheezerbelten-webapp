import React from 'react';
import styled from 'styled-components';

const LogoImage = styled.img`
  width: 180px;
  margin-bottom: 1rem;
  margin-top: -3rem;
`;

const Logo = () => {
  return (
    <LogoImage 
      src="https://www.vechtdalproducten.nl/wp-content/uploads/2017/05/rheezerbelten-logo.png" 
      alt="Rheezerbelten Logo" 
    />
  );
};

export default Logo;
