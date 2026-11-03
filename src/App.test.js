import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  test('renders the header and main sections', () => {
    render(<App />);
    expect(screen.getByText(/P_Ker Buddy/)).toBeInTheDocument();
    expect(screen.getByText('Game Information')).toBeInTheDocument();
    expect(screen.getByText('Your Hole Cards')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Community Cards/ })).toBeInTheDocument();
  });

  test('has no Live Tracking tab', () => {
    render(<App />);
    expect(screen.queryByText(/Live Tracking/)).not.toBeInTheDocument();
  });
});
