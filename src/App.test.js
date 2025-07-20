import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

// Mock the poker logic module
jest.mock('./utils/pokerLogic', () => ({
  analyzeHand: jest.fn()
}));

describe('Poker AI Advisor App', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('renders the main header', () => {
    render(<App />);
    const headerElement = screen.getByText(/🃏 Poker AI Advisor/i);
    expect(headerElement).toBeInTheDocument();
  });

  test('renders all main sections', () => {
    render(<App />);
    
    expect(screen.getByText('Your Hand')).toBeInTheDocument();
    expect(screen.getByText('Community Cards')).toBeInTheDocument();
    expect(screen.getByText('Game Information')).toBeInTheDocument();
    expect(screen.getByText('AI Recommendation')).toBeInTheDocument();
  });

  test('shows message when no hole cards are selected', () => {
    render(<App />);
    
    const analyzeButton = screen.getByText('Get AI Recommendation');
    expect(analyzeButton).toBeDisabled();
    
    expect(screen.getByText(/Please select your hole cards to get a recommendation/i)).toBeInTheDocument();
  });

  test('enables analyze button when hole cards are selected', async () => {
    render(<App />);
    
    // Select hole cards by clicking suit buttons
    const suitButtons = screen.getAllByText(/[♠♥♦♣]/);
    await userEvent.click(suitButtons[0]); // First suit
    await userEvent.click(suitButtons[1]); // Second suit
    
    const analyzeButton = screen.getByText('Get AI Recommendation');
    expect(analyzeButton).not.toBeDisabled();
  });

  test('displays game information correctly', () => {
    render(<App />);
    
    // Check default values
    expect(screen.getByDisplayValue('6')).toBeInTheDocument(); // Default players
    expect(screen.getByDisplayValue('middle')).toBeInTheDocument(); // Default position
    expect(screen.getByDisplayValue('100')).toBeInTheDocument(); // Default pot size
    expect(screen.getByDisplayValue('0')).toBeInTheDocument(); // Default bet size
  });

  test('allows changing game parameters', async () => {
    render(<App />);
    
    // Change number of players
    const playerSelect = screen.getByDisplayValue('6');
    await userEvent.selectOptions(playerSelect, '9');
    expect(screen.getByDisplayValue('9')).toBeInTheDocument();
    
    // Change position
    const positionSelect = screen.getByDisplayValue('middle');
    await userEvent.selectOptions(positionSelect, 'button');
    expect(screen.getByDisplayValue('button')).toBeInTheDocument();
    
    // Change pot size
    const potInput = screen.getByDisplayValue('100');
    await userEvent.clear(potInput);
    await userEvent.type(potInput, '250');
    expect(screen.getByDisplayValue('250')).toBeInTheDocument();
    
    // Change bet size
    const betInput = screen.getByDisplayValue('0');
    await userEvent.clear(betInput);
    await userEvent.type(betInput, '50');
    expect(screen.getByDisplayValue('50')).toBeInTheDocument();
  });

  test('shows pot odds calculation', async () => {
    render(<App />);
    
    // Set pot and bet to see pot odds
    const potInput = screen.getByDisplayValue('100');
    const betInput = screen.getByDisplayValue('0');
    
    await userEvent.clear(potInput);
    await userEvent.type(potInput, '200');
    await userEvent.clear(betInput);
    await userEvent.type(betInput, '50');
    
    // Check if pot odds are displayed (should be 400%)
    expect(screen.getByText(/400\.0%/)).toBeInTheDocument();
  });
}); 