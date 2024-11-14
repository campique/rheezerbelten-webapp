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
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  opacity: ${props => props.opacity};
  left: ${props => props.left}%;
  top: ${props => props.top}%;
  animation: twinkle 2s infinite;

  @keyframes twinkle {
    0%, 100% { opacity: ${props => props.opacity}; }
    50% { opacity: ${props => props.opacity * 0.5}; }
  }
`;

const Stars = () => {
  const starCount = 50;
  const stars = Array.from({ length: starCount }, () => ({
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: Math.random() * 2 + 1,
    opacity: Math.random() * 0.5 + 0.3,
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
