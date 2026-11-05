import React, { useState } from 'react';
import styled from 'styled-components';
import { Field, Label, Input, Select } from './formControls';

// "Set and forget" table settings: shown as a one-line summary, editable on demand.
// The values are saved in the browser by App, so they survive reloads.

const Bar = styled.section`
  background: ${props => props.theme.cardBackground};
  border: 1px solid ${props => props.theme.cardBorder};
  border-radius: 12px;
  padding: 10px 16px;
  margin-bottom: 18px;
`;

const Summary = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
`;

const BarTitle = styled.h2`
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 1.1rem;
  color: ${props => props.theme.primary};
  margin: 0;
`;

const Facts = styled.span`
  color: ${props => props.theme.text};
  font-size: 0.98rem;
`;

const EditButton = styled.button`
  margin-left: auto;
  background: none;
  border: 1.5px solid ${props => props.theme.warning};
  color: ${props => props.theme.primary};
  border-radius: 999px;
  padding: 4px 16px;
  font-weight: 600;
  cursor: pointer;

  &:hover { background: ${props => props.theme.buttonSecondary}; }
  &:focus-visible { outline: 3px solid ${props => props.theme.warning}; outline-offset: 2px; }
`;

const Fields = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-top: 12px;

  @media (max-width: 700px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const num = (value, fallback) => {
  const n = parseInt(value, 10);
  return Number.isNaN(n) ? fallback : n;
};

const GameInfo = ({
  numPlayers,
  smallBlind,
  bigBlind,
  stackSize,
  onNumPlayersChange,
  onSmallBlindChange,
  onBigBlindChange,
  onStackSizeChange
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Bar aria-labelledby="tableSettingsTitle">
      <Summary>
        <BarTitle id="tableSettingsTitle">Table settings</BarTitle>
        <Facts>
          {numPlayers} players &middot; Blinds {smallBlind}/{bigBlind} &middot; Stack {stackSize}
        </Facts>
        <EditButton type="button" aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? 'Done' : 'Edit'}
        </EditButton>
      </Summary>

      {open && (
        <Fields>
          <Field>
            <Label htmlFor="tsPlayers">Players at table</Label>
            <Select id="tsPlayers" value={numPlayers} onChange={(e) => onNumPlayersChange(parseInt(e.target.value, 10))}>
              {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                <option key={n} value={n}>{n}{n === 2 ? ' (heads-up)' : n === 9 ? ' (full ring)' : ''}</option>
              ))}
            </Select>
          </Field>
          <Field>
            <Label htmlFor="tsSb">Small blind ($)</Label>
            <Input id="tsSb" type="number" min="0" step="1" value={smallBlind}
              onChange={(e) => onSmallBlindChange(num(e.target.value, 0))} />
          </Field>
          <Field>
            <Label htmlFor="tsBb">Big blind ($)</Label>
            <Input id="tsBb" type="number" min="0" step="1" value={bigBlind}
              onChange={(e) => onBigBlindChange(num(e.target.value, 0))} />
          </Field>
          <Field>
            <Label htmlFor="tsStack">Stack ($)</Label>
            <Input id="tsStack" type="number" min="100" step="100" value={stackSize}
              onChange={(e) => onStackSizeChange(num(e.target.value, 1000))} />
          </Field>
        </Fields>
      )}
    </Bar>
  );
};

export default GameInfo;
