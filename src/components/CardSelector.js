import React from 'react';
import styled from 'styled-components';

export const RANKS = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];
export const SUITS = ['♠', '♥', '♦', '♣'];

const RANK_NAMES = { A: 'Ace', K: 'King', Q: 'Queen', J: 'Jack' };
const SUIT_NAMES = { '♠': 'spades', '♥': 'hearts', '♦': 'diamonds', '♣': 'clubs' };
const isRed = suit => suit === '♥' || suit === '♦';

const cardName = (rank, suit) => `${RANK_NAMES[rank] || rank} of ${SUIT_NAMES[suit]}`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(13, minmax(0, 1fr));
  gap: 4px;
`;

const Cell = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  height: 46px;
  padding: 0;
  border: 1.5px solid ${props => props.$selected ? props.theme.primary : props.theme.cardBorder};
  border-radius: 6px;
  background: ${props => props.$selected ? props.theme.primary : '#fff'};
  color: ${props => props.$selected ? '#fff' : isRed(props.$suit) ? '#c0392b' : props.theme.text};
  cursor: pointer;
  font-family: inherit;
  line-height: 1;

  b { font-size: 0.95rem; }
  i { font-style: normal; font-size: 0.95rem; }

  &:hover:not(:disabled) {
    border-color: ${props => props.theme.warning};
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.28;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 3px solid ${props => props.theme.warning};
    outline-offset: 1px;
  }

  @media (max-width: 600px) {
    height: 40px;
    border-radius: 4px;
    b, i { font-size: 0.78rem; }
  }
`;

// One-click deck: four suit rows by thirteen ranks.
// `selected` cards are highlighted, `blocked` cards (in use elsewhere) are greyed out.
export const DeckGrid = ({ selected = [], blocked = [], disabled = false, onPick, label = 'Pick a card' }) => (
  <Grid role="group" aria-label={label}>
    {SUITS.map(suit => RANKS.map(rank => {
      const card = `${rank}${suit}`;
      const isSelected = selected.includes(card);
      const isBlocked = blocked.includes(card);
      return (
        <Cell
          key={card}
          type="button"
          $suit={suit}
          $selected={isSelected}
          disabled={(disabled && !isSelected) || isBlocked}
          aria-pressed={isSelected}
          aria-label={cardName(rank, suit)}
          onClick={() => onPick(card)}
        >
          <b>{rank}</b>
          <i>{suit}</i>
        </Cell>
      );
    }))}
  </Grid>
);

export const Chips = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 12px;
  min-height: 62px;
`;

export const Chip = styled.div`
  position: relative;
  width: 46px;
  height: 62px;
  border: 2px solid ${props => props.theme.primary};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
  background: #fff;
  color: ${props => props.$red ? '#c0392b' : props.theme.text};
`;

export const Placeholder = styled.div`
  width: 46px;
  height: 62px;
  border: 2px dashed ${props => props.theme.inputBorder};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.textSecondary};
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.4px;
`;

export const RemoveButton = styled.button`
  position: absolute;
  top: -8px;
  right: -8px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: none;
  background: ${props => props.theme.error};
  color: white;
  font-size: 13px;
  line-height: 1;
  cursor: pointer;
  padding: 0;

  &:focus-visible { outline: 3px solid ${props => props.theme.warning}; outline-offset: 1px; }
`;

export const Count = styled.p`
  margin: 8px 0 0;
  font-size: 0.82rem;
  color: ${props => props.theme.textSecondary};
`;

const CardSelector = ({ selectedCards, onCardsChange, maxCards, title, blockedCards = [] }) => {
  const pick = (card) => {
    if (selectedCards.includes(card)) {
      onCardsChange(selectedCards.filter(c => c !== card));
    } else if (selectedCards.length < maxCards) {
      onCardsChange([...selectedCards, card]);
    }
  };

  const slots = Array.from({ length: maxCards }, (_, i) => selectedCards[i] || null);

  return (
    <div>
      {title ? <h3>{title}</h3> : null}

      <Chips>
        {slots.map((card, index) => card ? (
          <Chip key={card} $red={isRed(card.slice(-1))}>
            {card}
            <RemoveButton type="button" aria-label={`Remove ${card}`} onClick={() => onCardsChange(selectedCards.filter(c => c !== card))}>×</RemoveButton>
          </Chip>
        ) : (
          <Placeholder key={`empty-${index}`}>Card {index + 1}</Placeholder>
        ))}
      </Chips>

      <DeckGrid
        selected={selectedCards}
        blocked={blockedCards}
        disabled={selectedCards.length >= maxCards}
        onPick={pick}
        label={title || 'Pick a card'}
      />

      <Count>Selected: {selectedCards.length}/{maxCards}</Count>
    </div>
  );
};

export default CardSelector;
