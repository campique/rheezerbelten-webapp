import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const MascotWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  max-width: 450px;
  margin-bottom: 1rem;
`;

const MascotImage = styled.img`
  width: 160px;
  height: 160px;
  object-fit: contain;
  animation: ${props => props.jumping ? 'jump 0.5s' : 'hop 2s ease-in-out infinite'};

  @keyframes hop {
    0%, 50%, 100% { transform: translateY(0); }
    25% { transform: translateY(-5px); }
    75% { transform: translateY(-3px); }
  }

  @keyframes jump {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-30px); }
  }
`;

const SpeechBubble = styled.div`
  position: absolute;
  left: 150px;
  top: 50%;
  transform: translateY(-50%);
  background-color: white;
  border-radius: 20px;
  padding: 15px;
  max-width: 180px;
  text-align: center;
  font-size: 0.9rem;
  opacity: ${props => props.show ? 1 : 0};
  transition: opacity 0.5s, transform 0.5s;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  z-index: 1;

  &::before {
    content: '';
    position: absolute;
    left: -10px;
    top: 50%;
    border: 6px solid transparent;
    border-right-color: white;
    transform: translateY(-50%);
  }
`;

const responses = {
  greeting: "Hoi! Ik ben Knof. Wat zullen we gaan doen?",
  homeResponse: "Welkom op de homepage!",
  gamesResponse: "Laten we een spelletje spelen!",
  // Voeg hier meer Nederlandse responses toe voor andere pagina's
};

const Mascot = ({ currentPage }) => {
  const [showBubble, setShowBubble] = useState(false);
  const [jumping, setJumping] = useState(false);
  const [bubbleText, setBubbleText] = useState('');

  useEffect(() => {
    setShowBubble(false);
    setJumping(true);
    setTimeout(() => {
      setJumping(false);
      setBubbleText(responses[`${currentPage}Response`] || responses.greeting);
      setShowBubble(true);
    }, 500);
  }, [currentPage]);

  return (
    <MascotWrapper>
      <MascotImage 
        src="https://fcdn.answerly.io/477718fd-e50b-4758-8fcb-7709dedf75ec/6252f73f-ec36-4813-9c2c-dbf42ed04cfa.png" 
        alt="Knof" 
        jumping={jumping}
      />
      <SpeechBubble show={showBubble}>
        {bubbleText}
      </SpeechBubble>
    </MascotWrapper>
  );
};

export default Mascot;
