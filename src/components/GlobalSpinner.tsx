import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(255,255,255,0.7);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Spinner = styled.div`
  width: 64px;
  height: 64px;
  border: 8px solid #eee;
  border-top: 8px solid #0b8783;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

export default function GlobalSpinner() {
  return (
    <Overlay>
      <Spinner />
    </Overlay>
  );
}
