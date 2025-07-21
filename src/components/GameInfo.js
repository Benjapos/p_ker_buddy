import React from 'react';
import styled from 'styled-components';

const FormGroup = styled.div`
  margin-bottom: 10px;
  width: 100%;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 3px;
  font-weight: 500;
  color: #333;
  font-size: 13px;
`;

const Input = styled.input`
  width: 100%;
  padding: 6px;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: #2196F3;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 6px;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #2196F3;
  }
`;



const GameInfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const GameInfo = ({ 
  numPlayers, 
  position, 
  potSize, 
  betSize, 
  smallBlind, 
  bigBlind,
  stackSize = 1000,
  onNumPlayersChange,
  onPositionChange,
  onPotSizeChange,
  onBetSizeChange,
  onSmallBlindChange,
  onBigBlindChange,
  onStackSizeChange
}) => {
  return (
    <GameInfoContainer>
      <FormGroup>
        <Label>Number of Players</Label>
        <Select
          value={numPlayers}
          onChange={(e) => onNumPlayersChange(parseInt(e.target.value))}
        >
          <option value={2}>2 players (Heads-up)</option>
          <option value={3}>3 players</option>
          <option value={4}>4 players</option>
          <option value={5}>5 players</option>
          <option value={6}>6 players (Standard)</option>
          <option value={7}>7 players</option>
          <option value={8}>8 players</option>
          <option value={9}>9 players (Full ring)</option>
          <option value={10}>10 players</option>
        </Select>
      </FormGroup>

      <FormGroup>
        <Label>Your Position</Label>
        <Select
          value={position}
          onChange={(e) => onPositionChange(e.target.value)}
        >
          <option value="early">Early Position (UTG, UTG+1)</option>
          <option value="middle">Middle Position (MP, MP+1)</option>
          <option value="late">Late Position (CO, HJ)</option>
          <option value="button">Button (BTN)</option>
          <option value="small_blind">Small Blind (SB)</option>
          <option value="big_blind">Big Blind (BB)</option>
        </Select>
      </FormGroup>

      <FormGroup>
        <Label>Pot Size ($)</Label>
        <Input
          type="number"
          value={potSize}
          onChange={(e) => onPotSizeChange(parseInt(e.target.value) || 0)}
          min="0"
          step="1"
          placeholder="Enter pot size"
        />
      </FormGroup>

      <FormGroup>
        <Label>Small Blind ($)</Label>
        <Input
          type="number"
          value={smallBlind}
          onChange={(e) => onSmallBlindChange(parseInt(e.target.value) || 0)}
          min="0"
          step="1"
          placeholder="Enter small blind"
        />
      </FormGroup>

      <FormGroup>
        <Label>Big Blind ($)</Label>
        <Input
          type="number"
          value={bigBlind}
          onChange={(e) => onBigBlindChange(parseInt(e.target.value) || 0)}
          min="0"
          step="1"
          placeholder="Enter big blind"
        />
      </FormGroup>

      <FormGroup>
        <Label>Current Bet Size ($)</Label>
        <Input
          type="number"
          value={betSize}
          onChange={(e) => onBetSizeChange(parseInt(e.target.value) || 0)}
          min="0"
          step="1"
          placeholder="Enter current bet size"
        />
      </FormGroup>

      <FormGroup>
        <Label>Stack Size ($)</Label>
        <Input
          type="number"
          value={stackSize}
          onChange={(e) => onStackSizeChange && onStackSizeChange(parseInt(e.target.value) || 1000)}
          min="100"
          step="100"
          placeholder="Enter stack size"
        />
      </FormGroup>
    </GameInfoContainer>
  );
};

export default GameInfo; 