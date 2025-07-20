import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CardSelector from '../CardSelector';

describe('CardSelector', () => {
  const mockOnCardsChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders with title', () => {
    render(
      <CardSelector
        selectedCards={[]}
        onCardsChange={mockOnCardsChange}
        maxCards={2}
        title="Test Cards"
      />
    );
    
    expect(screen.getByText('Test Cards')).toBeInTheDocument();
  });

  test('displays selected cards', () => {
    const selectedCards = ['A♠', 'K♥'];
    
    render(
      <CardSelector
        selectedCards={selectedCards}
        onCardsChange={mockOnCardsChange}
        maxCards={2}
        title="Test Cards"
      />
    );
    
    expect(screen.getByText('A♠')).toBeInTheDocument();
    expect(screen.getByText('K♥')).toBeInTheDocument();
  });

  test('allows removing selected cards', async () => {
    const selectedCards = ['A♠', 'K♥'];
    
    render(
      <CardSelector
        selectedCards={selectedCards}
        onCardsChange={mockOnCardsChange}
        maxCards={2}
        title="Test Cards"
      />
    );
    
    const removeButtons = screen.getAllByText('×');
    await userEvent.click(removeButtons[0]);
    
    expect(mockOnCardsChange).toHaveBeenCalledWith(['K♥']);
  });

  test('shows correct card count', () => {
    const selectedCards = ['A♠'];
    
    render(
      <CardSelector
        selectedCards={selectedCards}
        onCardsChange={mockOnCardsChange}
        maxCards={2}
        title="Test Cards"
      />
    );
    
    expect(screen.getByText('Selected: 1/2')).toBeInTheDocument();
  });

  test('displays all ranks', () => {
    render(
      <CardSelector
        selectedCards={[]}
        onCardsChange={mockOnCardsChange}
        maxCards={2}
        title="Test Cards"
      />
    );
    
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    ranks.forEach(rank => {
      expect(screen.getByText(rank)).toBeInTheDocument();
    });
  });

  test('displays all suits', () => {
    render(
      <CardSelector
        selectedCards={[]}
        onCardsChange={mockOnCardsChange}
        maxCards={2}
        title="Test Cards"
      />
    );
    
    const suits = ['♠', '♥', '♦', '♣'];
    suits.forEach(suit => {
      expect(screen.getByText(suit)).toBeInTheDocument();
    });
  });

  test('prevents selecting more than max cards', async () => {
    const selectedCards = ['A♠', 'K♥'];
    
    render(
      <CardSelector
        selectedCards={selectedCards}
        onCardsChange={mockOnCardsChange}
        maxCards={2}
        title="Test Cards"
      />
    );
    
    // Try to select another card
    const suitButtons = screen.getAllByText(/[♠♥♦♣]/);
    await userEvent.click(suitButtons[2]); // Third suit
    
    // Should not call onCardsChange since max is reached
    expect(mockOnCardsChange).not.toHaveBeenCalled();
  });
}); 