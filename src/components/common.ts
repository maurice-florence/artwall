import styled from 'styled-components';

// A generic, reusable icon button for header controls.
export const BaseIconButton = styled.button<{ $active?: boolean }>`
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  background: none;
  border: none;
  color: ${({ theme, $active }) => $active ? theme.primary : theme.secondary};
  font-size: 1.2rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  height: calc(1rem + 0.8rem);
  &:hover {
    color: ${({ theme }) => theme.primary};
  }
  transition: color 0.2s, opacity 0.2s, transform 0.2s;
  ${({ $active }) => $active ? `
    opacity: 1;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.06));
  ` : `
    opacity: 0.7;
  `}
`;

// A generic, reusable dropdown container with animations.
export const Dropdown = styled.div<{ $closing?: boolean }>`
  position: absolute;
  top: calc(100% - 2px); /* Account for the padding-bottom */
  right: 0;
  background: ${({ theme }) => theme.body};
  border: 1px solid rgba(0,0,0,0.08);
  padding: 0.4rem;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  z-index: 200;
  box-shadow: 0 6px 18px rgba(0,0,0,0.08);
  opacity: 0;
  transform: translateY(-6px) scale(0.99);
  animation: ${({ $closing }) => $closing ? 'fadeOutDown 140ms ease forwards' : 'fadeInUp 160ms ease forwards'};

  @keyframes fadeInUp {
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes fadeOutDown {
    to { opacity: 0; transform: translateY(-6px) scale(0.99); }
  }

  /* Prevent dropdown from going off-screen on mobile */
  @media (max-width: 768px) {
    right: auto;
    left: 50%;
    transform: translateX(-50%) translateY(-6px) scale(0.99);
    
    &:not([style*="animation"]) {
      /* Ensure centered position during animation */
      animation: ${({ $closing }) => $closing ? 'fadeOutDownCenter 140ms ease forwards' : 'fadeInUpCenter 160ms ease forwards'};
    }

    @keyframes fadeInUpCenter {
      to { 
        opacity: 1; 
        transform: translateX(-50%) translateY(0) scale(1);
      }
    }
    @keyframes fadeOutDownCenter {
      to { 
        opacity: 0; 
        transform: translateX(-50%) translateY(-6px) scale(0.99);
      }
    }

    /* Prevent overflowing viewport */
    max-width: calc(100vw - 2rem);
  }
`;