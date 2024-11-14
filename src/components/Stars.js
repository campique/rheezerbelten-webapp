import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

const StarsContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
`;

const Star = styled.div`
  position: absolute;
  background-color: white;
  border-radius: 50%;
  opacity: 0.8;
  animation: twinkle 2s infinite;

  @keyframes twinkle {
    0%, 100% { opacity: 0.8; }
    50% { opacity: 0.5; }
  }
`;

const Stars = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const createStar = (index) => {
      setTimeout(() => {
        const star = document.createElement('div');
        star.className = Star.styledComponentId;
        star.style.width = `${Math.random() * 3 + 1}px`;
        star.style.height = star.style.width;
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.animationDelay = `${Math.random() * 2}s`;
        container.appendChild(star);
      }, index * 50); // Add a small delay for each star
    };

    for (let i = 0; i < 50; i++) {
      createStar(i);
    }

    return () => {
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    };
  }, []);

  return <StarsContainer ref={containerRef} />;
};

export default Stars;
