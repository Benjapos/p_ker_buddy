import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  test('renders the header and main sections', () => {
    render(<App />);
    expect(screen.getByText(/P_Ker Buddy/)).toBeInTheDocument();
    expect(screen.getByText('Table settings')).toBeInTheDocument();
    expect(screen.getByText('This Hand')).toBeInTheDocument();
    expect(screen.getByText('Your Hole Cards')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Community Cards/ })).toBeInTheDocument();
  });

  test('has no preflop/postflop toggle: no flop means preflop', () => {
    render(<App />);
    expect(screen.queryByRole('button', { name: /^.*Preflop$/ })).not.toBeInTheDocument();
    expect(screen.getByText(/No flop yet/)).toBeInTheDocument();
  });

  test('has no Live Tracking tab', () => {
    render(<App />);
    expect(screen.queryByText(/Live Tracking/)).not.toBeInTheDocument();
  });
});
