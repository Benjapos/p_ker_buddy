import React from 'react';
import styled from 'styled-components';

const FormGroup = styled.div`
  margin-bottom: 15px;
  width: 100%;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
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
  padding: 8px;
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

const BettingRound = styled.div`
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 12px;
`;

const RoundTitle = styled.h4`
  margin: 0 0 10px 0;
  color: #1e3c72;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
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
      
      <div>
        <BettingRound>
          <RoundTitle>Betting Round</RoundTitle>
          <div style={{ fontSize: '14px', color: '#666' }}>
            <p style={{ margin: '5px 0' }}>
              <strong>Pre-flop:</strong> Before community cards
            </p>
            <p style={{ margin: '5px 0' }}>
              <strong>Flop:</strong> First 3 community cards
            </p>
            <p style={{ margin: '5px 0' }}>
              <strong>Turn:</strong> 4th community card
            </p>
            <p style={{ margin: '5px 0' }}>
              <strong>River:</strong> 5th community card
            </p>
          </div>
        </BettingRound>

        <div style={{ 
          background: '#f5f5f5', 
          padding: '15px', 
          borderRadius: '8px', 
          marginTop: '20px' 
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#1e3c72' }}>Texas Hold'em Summary</h4>
          <p style={{ margin: '5px 0', fontSize: '14px' }}>
            <strong>Players:</strong> {numPlayers}
          </p>
          <p style={{ margin: '5px 0', fontSize: '14px' }}>
            <strong>Position:</strong> {position.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </p>
          <p style={{ margin: '5px 0', fontSize: '14px' }}>
            <strong>Pot:</strong> ${potSize}
          </p>
          <p style={{ margin: '5px 0', fontSize: '14px' }}>
            <strong>Small Blind:</strong> ${smallBlind}
          </p>
          <p style={{ margin: '5px 0', fontSize: '14px' }}>
            <strong>Big Blind:</strong> ${bigBlind}
          </p>
          <p style={{ margin: '5px 0', fontSize: '14px' }}>
            <strong>Bet:</strong> ${betSize}
          </p>
          {betSize > 0 && (
            <p style={{ margin: '5px 0', fontSize: '14px' }}>
              <strong>Pot Odds:</strong> {((potSize / betSize) * 100).toFixed(1)}%
            </p>
          )}
          <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
            <strong>Game:</strong> No-Limit Texas Hold'em
          </p>
        </div>
      </div>
    </GameInfoContainer>
  );
};

export default GameInfo; 