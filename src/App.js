import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { GlobalStyle } from './styles/GlobalStyle';
import LanguageSwitch from './components/LanguageSwitch';
import Stars from './components/Stars';
import Logo from './components/Logo';
import Mascot from './components/Mascot';
import Menu from './components/Menu';

const AppWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem 1rem;
  position: relative;
  z-index: 2;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
  padding: 2rem 1rem;
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
        <LanguageSwitch 
          currentLanguage={currentLanguage} 
          toggleLanguage={toggleLanguage}
        />
        <ContentWrapper>
          <Logo />
          <Mascot 
            currentLanguage={currentLanguage}
            currentPage={window.location.pathname}
          />
          <Menu 
            currentLanguage={currentLanguage}
            navigateToPage={navigateToPage}
          />
          <Routes>
            <Route path="/" element={<div>Home Page</div>} />
          </Routes>
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
