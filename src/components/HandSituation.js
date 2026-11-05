import React from 'react';
import styled from 'styled-components';
import { Field, Label, Input, Select, Hint } from './formControls';

// Details that change every hand: where you sit, the pot, and the bet you are facing.

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const Wide = styled.div`
  grid-column: 1 / -1;
`;

const num = (value) => {
  const n = parseInt(value, 10);
  return Number.isNaN(n) ? 0 : n;
};

const HandSituation = ({
  position, potSize, betSize, isPreflop = false, preflopAction = 'open',
  onPositionChange, onPotSizeChange, onBetSizeChange, onPreflopActionChange
}) => (
  <Grid>
    {isPreflop && (
      <Wide>
        <Field>
          <Label htmlFor="hsAction">Action before you</Label>
          <Select id="hsAction" value={preflopAction} onChange={(e) => onPreflopActionChange(e.target.value)}>
            <option value="open">No one has acted (you open)</option>
            <option value="limp">Someone limped</option>
            <option value="raise">Someone raised</option>
          </Select>
          {preflopAction === 'raise' && <Hint>Enter the raise size in "Bet to call" below.</Hint>}
        </Field>
      </Wide>
    )}
    <Field>
      <Label htmlFor="hsPosition">Your position</Label>
      <Select id="hsPosition" value={position} onChange={(e) => onPositionChange(e.target.value)}>
        <option value="early">Early (UTG, UTG+1)</option>
        <option value="middle">Middle (MP)</option>
        <option value="late">Late (HJ, CO)</option>
        <option value="button">Button</option>
        <option value="small_blind">Small blind</option>
        <option value="big_blind">Big blind</option>
      </Select>
    </Field>
    <Field>
      <Label htmlFor="hsPot">Pot ($)</Label>
      <Input id="hsPot" type="number" min="0" step="1" value={potSize}
        onChange={(e) => onPotSizeChange(num(e.target.value))} />
      <Hint>Before the bet you face</Hint>
    </Field>
    <Field>
      <Label htmlFor="hsBet">Bet to call ($)</Label>
      <Input id="hsBet" type="number" min="0" step="1" value={betSize}
        onChange={(e) => onBetSizeChange(num(e.target.value))} />
      <Hint>{isPreflop ? 'Only used when someone raised' : '0 if no one has bet'}</Hint>
    </Field>
  </Grid>
);

export default HandSituation;
