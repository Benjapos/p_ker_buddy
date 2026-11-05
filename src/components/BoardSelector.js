import React from 'react';
import styled from 'styled-components';
import { DeckGrid, Chip, Placeholder, RemoveButton, Count } from './CardSelector';

// Five board slots (flop x3, turn, river) filled in order from one shared deck grid.

const Slots = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 18px;
  flex-wrap: wrap;
  margin-bottom: 12px;
`;

const Group = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  > span {
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    color: ${props => props.theme.textSecondary};
  }

  > div {
    display: flex;
    gap: 8px;
  }
`;

const ClearButton = styled.button`
  background: none;
  border: 1.5px solid ${props => props.theme.error};
  color: ${props => props.theme.error};
  border-radius: 999px;
  padding: 4px 14px;
  font-weight: 600;
  cursor: pointer;
  margin-left: auto;
  align-self: center;

  &:hover { background: ${props => props.theme.buttonSecondary}; }
  &:focus-visible { outline: 3px solid ${props => props.theme.warning}; outline-offset: 2px; }
`;

const isRed = card => card.endsWith('♥') || card.endsWith('♦');

const BoardSelector = ({
  flop = [],
  turn = null,
  river = null,
  onFlopChange,
  onTurnChange,
  onRiverChange,
  blockedCards = []
}) => {
  const board = [...flop, turn, river].filter(Boolean);
  const full = flop.length === 3 && !!turn && !!river;

  const pick = (card) => {
    // Clicking a card that is already on the board removes it
    if (flop.includes(card)) return onFlopChange(flop.filter(c => c !== card));
    if (turn === card) return onTurnChange(null);
    if (river === card) return onRiverChange(null);

    if (flop.length < 3) onFlopChange([...flop, card]);
    else if (!turn) onTurnChange(card);
    else if (!river) onRiverChange(card);
  };

  const clearAll = () => {
    onFlopChange([]);
    onTurnChange(null);
    onRiverChange(null);
  };

  const renderChip = (card, onRemove) => (
    <Chip key={card} $red={isRed(card)}>
      {card}
      <RemoveButton type="button" aria-label={`Remove ${card}`} onClick={onRemove}>×</RemoveButton>
    </Chip>
  );

  return (
    <div>
      <Slots>
        <Group>
          <span>Flop</span>
          <div>
            {[0, 1, 2].map(i => flop[i]
              ? renderChip(flop[i], () => onFlopChange(flop.filter(c => c !== flop[i])))
              : <Placeholder key={`flop-${i}`}>Flop</Placeholder>)}
          </div>
        </Group>
        <Group>
          <span>Turn</span>
          <div>{turn ? renderChip(turn, () => onTurnChange(null)) : <Placeholder>Turn</Placeholder>}</div>
        </Group>
        <Group>
          <span>River</span>
          <div>{river ? renderChip(river, () => onRiverChange(null)) : <Placeholder>River</Placeholder>}</div>
        </Group>
        {board.length > 0 && <ClearButton type="button" onClick={clearAll}>Clear board</ClearButton>}
      </Slots>

      <DeckGrid
        selected={board}
        blocked={blockedCards}
        disabled={full}
        onPick={pick}
        label="Pick a community card"
      />

      <Count>Board: {board.length}/5</Count>
    </div>
  );
};

export default BoardSelector;
