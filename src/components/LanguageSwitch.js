import React from 'react';
import styled from 'styled-components';
import { translations } from '../utils/translations';

const SwitchButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: white;
  border: none;
  border-radius: 5px;
  padding: 5px 10px;
  cursor: pointer;
  font-family: 'Fredoka One', cursive;
  font-size: 1rem;
`;

const LanguageSwitch = ({ currentLanguage, toggleLanguage }) => {
  return (
    <SwitchButton onClick={toggleLanguage}>
      {translations[currentLanguage].switchLanguage}
    </SwitchButton>
  );
};

export default LanguageSwitch;
