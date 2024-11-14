import React from 'react';
import styled from 'styled-components';

const StarsContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
`;

const Star = styled.div`
  position: absolute;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  background-color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 0 ${props => props.size / 2}px rgba(255, 255, 255, 0.7);
  border-radius: 50%;
  opacity: ${props => props.opacity};
  left: ${props => props.left}%;
  top: ${props => props.top}%;
  animation: twinkle 3s infinite;

  @keyframes twinkle {
    0%, 100% { opacity: ${props => props.opacity}; }
    50% { opacity: ${props => props.opacity * 0.5}; }
  }
`;

const Stars = () => {
  const starCount = 70; // Verhoog het aantal sterren
  const stars = Array.from({ length: starCount }, () => ({
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: Math.random() * 3 + 1.5, // Maak de sterren iets groter
    opacity: Math.random() * 0.5 + 0.5, // Verhoog de minimale opaciteit
  }));

  return (
    <StarsContainer>
      {stars.map((star, index) => (
        <Star key={index} {...star} />
      ))}
    </StarsContainer>
  );
};

export default Stars;
