import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { GlobalStyle } from './styles/GlobalStyle';
import LanguageSwitch from './components/LanguageSwitch';
import Stars from './components/Stars';
import Logo from './components/Logo';
import Mascot from './components/Mascot';
import Menu from './components/Menu';
import ConnectFour from './games/ConnectFour';
import PancakeDobble from './games/PancakeDobble';
import Pictionary from './games/Pictionary';

const AppWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 2rem 1rem;
  position: relative;
  z-index: 2;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-grow: 1;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
`;

const TopSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

const GameSection = styled.div`
  width: 100%;
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 2rem;
`;

function AppContent() {
  const [currentLanguage, setCurrentLanguage] = useState('nl');
  const navigate = useNavigate();

  const toggleLanguage = () => {
    setCurrentLanguage(currentLanguage === 'nl' ? 'de' : 'nl');
  };

  const navigateToPage = (page) => {
    navigate(page);
  };

  return (
    <>
      <GlobalStyle />
      <Stars />
      <AppWrapper>
        <ContentWrapper>
          <TopSection>
            <LanguageSwitch 
              currentLanguage={currentLanguage} 
              toggleLanguage={toggleLanguage}
            />
            <Logo />
            <Mascot 
              currentLanguage={currentLanguage}
              currentPage={window.location.pathname}
            />
            <Menu 
              currentLanguage={currentLanguage}
              navigateToPage={navigateToPage}
            />
          </TopSection>
          <GameSection>
            <Routes>
              <Route path="/" element={<div></div>} />
              <Route path="/games/connect-four" element={<ConnectFour />} />
              <Route path="/games/pancake-dobble" element={<PancakeDobble />} />
              <Route path="/games/pictionary" element={<Pictionary />} />
            </Routes>
          </GameSection>
        </ContentWrapper>
      </AppWrapper>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
