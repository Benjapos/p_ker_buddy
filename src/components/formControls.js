import styled from 'styled-components';

// Shared form controls so every panel on the analysis page looks the same.
export const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

export const Label = styled.label`
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: ${props => props.theme.textSecondary};
`;

const controlStyles = props => `
  width: 100%;
  padding: 9px 10px;
  border: 1.5px solid ${props.theme.inputBorder};
  border-radius: 8px;
  font-size: 1rem;
  background: ${props.theme.inputBackground};
  color: ${props.theme.text};

  &:focus-visible {
    outline: 3px solid ${props.theme.warning};
    outline-offset: 1px;
    border-color: ${props.theme.primary};
  }
`;

export const Input = styled.input`
  ${controlStyles}
`;

export const Select = styled.select`
  ${controlStyles}
  cursor: pointer;
`;

export const Hint = styled.span`
  font-size: 0.8rem;
  color: ${props => props.theme.textSecondary};
`;
