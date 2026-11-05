import React, { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from 'styled-components';
import CardSelector from '../CardSelector';
import BoardSelector from '../BoardSelector';

const theme = {
  primary: '#124a2d', warning: '#c39a2e', error: '#b5483a', text: '#1f2a22', textSecondary: '#5f675f',
  cardBorder: '#e8dfca', inputBorder: '#d9cfb4', buttonSecondary: '#f3ecd9'
};
const wrap = ui => render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

describe('CardSelector', () => {
  const onChange = jest.fn();
  beforeEach(() => jest.clearAllMocks());

  test('renders the title and all 52 cards', () => {
    wrap(<CardSelector selectedCards={[]} onCardsChange={onChange} maxCards={2} title="Test Cards" />);
    expect(screen.getByText('Test Cards')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /of (spades|hearts|diamonds|clubs)$/ })).toHaveLength(52);
  });

  test('displays selected cards and the count', () => {
    wrap(<CardSelector selectedCards={['A♠', 'K♥']} onCardsChange={onChange} maxCards={2} title="" />);
    expect(screen.getByText('A♠')).toBeInTheDocument();
    expect(screen.getByText('K♥')).toBeInTheDocument();
    expect(screen.getByText('Selected: 2/2')).toBeInTheDocument();
  });

  test('picks a card in one click', async () => {
    wrap(<CardSelector selectedCards={['A♠']} onCardsChange={onChange} maxCards={2} title="" />);
    await userEvent.click(screen.getByRole('button', { name: 'King of hearts' }));
    expect(onChange).toHaveBeenCalledWith(['A♠', 'K♥']);
  });

  test('removes a selected card', async () => {
    wrap(<CardSelector selectedCards={['A♠', 'K♥']} onCardsChange={onChange} maxCards={2} title="" />);
    await userEvent.click(screen.getByRole('button', { name: 'Remove A♠' }));
    expect(onChange).toHaveBeenCalledWith(['K♥']);
  });

  test('does not allow more than the maximum', async () => {
    wrap(<CardSelector selectedCards={['A♠', 'K♥']} onCardsChange={onChange} maxCards={2} title="" />);
    expect(screen.getByRole('button', { name: 'Queen of clubs' })).toBeDisabled();
  });

  test('blocked cards (used elsewhere) cannot be picked', () => {
    wrap(<CardSelector selectedCards={[]} onCardsChange={onChange} maxCards={2} title="" blockedCards={['3♦']} />);
    expect(screen.getByRole('button', { name: '3 of diamonds' })).toBeDisabled();
  });
});

describe('BoardSelector', () => {
  const Harness = ({ blockedCards = [] }) => {
    const [flop, setFlop] = useState([]);
    const [turn, setTurn] = useState(null);
    const [river, setRiver] = useState(null);
    return (
      <BoardSelector flop={flop} turn={turn} river={river} blockedCards={blockedCards}
        onFlopChange={setFlop} onTurnChange={setTurn} onRiverChange={setRiver} />
    );
  };

  test('fills flop, then turn, then river from one grid', async () => {
    wrap(<Harness />);
    for (const name of ['3 of hearts', '4 of clubs', '8 of diamonds', '2 of diamonds', 'Ace of spades']) {
      await userEvent.click(screen.getByRole('button', { name }));
    }
    expect(screen.getByText('Board: 5/5')).toBeInTheDocument();
    expect(screen.getByText('3♥')).toBeInTheDocument();
    expect(screen.getByText('A♠')).toBeInTheDocument();
    // A sixth card cannot be added
    expect(screen.getByRole('button', { name: 'King of spades' })).toBeDisabled();
  });

  test('cards held in your hand are blocked on the board', () => {
    wrap(<Harness blockedCards={['2♠', '3♠']} />);
    expect(screen.getByRole('button', { name: '2 of spades' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '3 of spades' })).toBeDisabled();
  });

  test('clicking a board card again removes it, and Clear board empties the board', async () => {
    wrap(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'Queen of hearts' }));
    expect(screen.getByText('Board: 1/5')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Queen of hearts' }));
    expect(screen.getByText('Board: 0/5')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Jack of clubs' }));
    await userEvent.click(screen.getByRole('button', { name: 'Clear board' }));
    expect(screen.getByText('Board: 0/5')).toBeInTheDocument();
  });
});
