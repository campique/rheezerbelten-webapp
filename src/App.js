import React, { useState } from 'react';
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
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
  padding: 2rem 1rem;
`;

function App() {
  const [currentLanguage, setCurrentLanguage] = useState('nl');
  const [currentPage, setCurrentPage] = useState('home');

  const toggleLanguage = () => {
    setCurrentLanguage(currentLanguage === 'nl' ? 'de' : 'nl');
  };

  const navigateToPage = (page) => {
    setCurrentPage(page);
  };

  return (
    <>
      <GlobalStyle />
      <AppWrapper>
        <LanguageSwitch 
          currentLanguage={currentLanguage} 
          toggleLanguage={toggleLanguage}
        />
        <Stars />
        <ContentWrapper>
          <Logo />
          <Mascot 
            currentLanguage={currentLanguage}
            currentPage={currentPage}
          />
          <Menu 
            currentLanguage={currentLanguage}
            navigateToPage={navigateToPage}
          />
        </ContentWrapper>
      </AppWrapper>
    </>
  );
}

export default App;
