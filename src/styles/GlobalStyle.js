import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    font-family: 'Fredoka One', cursive;
    background: linear-gradient(45deg, #e07a7e 0%, #d6a8a0 99%, #d6a8a0 100%);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem 1rem;
    overflow: hidden;
    color: #333; /* Donkerdere tekstkleur voor betere leesbaarheid */
  }

  @media (max-height: 700px) {
    body {
      padding: 1rem;
    }
  }

  /* Voeg een overlay toe om de achtergrond nog iets donkerder te maken */
  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.2);
    z-index: -1;
  }
`;
