import React from 'react';
import styled from 'styled-components';
import CardSelector from './CardSelector';

const BoardSection = styled.div`
  margin-bottom: 20px;
`;

const BoardTitle = styled.h4`
  color: #1e3c72;
  margin-bottom: 10px;
`;

const BoardCards = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 10px;
  flex-wrap: wrap;
  align-items: center;
`;

const BoardCard = styled.div`
  width: 50px;
  height: 70px;
  border: 2px solid #ddd;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 16px;
  background: white;
  color: #333;
  position: relative;
  flex-shrink: 0;
  
  &:hover {
    border-color: #007bff;
  }
`;

const RemoveButton = styled.button`
  position: absolute;
  top: -8px;
  right: -8px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: none;
  background: #ff4444;
  color: white;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ClearButton = styled.button`
  background: #ff9800;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  margin-top: 10px;
  
  &:hover {
    background: #f57c00;
  }
`;

const BoardSelector = ({ flop, turn, river, onFlopChange, onTurnChange, onRiverChange, disabled = false }) => {
  const clearFlop = () => onFlopChange([]);
  const clearTurn = () => onTurnChange(null);
  const clearRiver = () => onRiverChange(null);

  const removeFlopCard = (card) => {
    onFlopChange(flop.filter(c => c !== card));
  };

  // Create unified community cards display
  const allCommunityCards = [...flop, turn, river].filter(Boolean);
  
  // Debug logging
  console.log('BoardSelector - flop:', flop, 'turn:', turn, 'river:', river);

  return (
    <div style={{ opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? 'none' : 'auto' }}>
      {disabled && (
        <div style={{ 
          textAlign: 'center', 
          padding: '20px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '10px', 
          marginBottom: '20px',
          border: '2px dashed #dee2e6'
        }}>
          <h4 style={{ color: '#6c757d', margin: '0 0 10px 0' }}>🃏 Preflop Mode</h4>
          <p style={{ color: '#6c757d', margin: 0, fontSize: '14px' }}>
            Community cards are not available in preflop mode. Switch to Postflop to analyze with community cards.
          </p>
        </div>
      )}

      {/* Unified Community Cards Display */}
      {allCommunityCards.length > 0 && (
        <BoardSection>
          <BoardTitle>Community Cards</BoardTitle>
          <BoardCards>
            {flop.map((card, index) => (
              <BoardCard key={`flop-${card}-${index}`} style={{ borderColor: '#4CAF50' }}>
                {card}
                <RemoveButton onClick={() => removeFlopCard(card)}>×</RemoveButton>
              </BoardCard>
            ))}
            {turn && (
              <BoardCard key="turn" style={{ borderColor: '#FF9800' }}>
                {turn}
                <RemoveButton onClick={clearTurn}>×</RemoveButton>
              </BoardCard>
            )}
            {river && (
              <BoardCard key="river" style={{ borderColor: '#2196F3' }}>
                {river}
                <RemoveButton onClick={clearRiver}>×</RemoveButton>
              </BoardCard>
            )}
          </BoardCards>
        </BoardSection>
      )}
      
      <BoardSection>
        <BoardTitle>Flop (3 cards)</BoardTitle>
        {flop.length < 3 && (
          <CardSelector
            selectedCards={[]}
            onCardsChange={onFlopChange}
            maxCards={3}
            title=""
          />
        )}
        {flop.length > 0 && <ClearButton onClick={clearFlop}>Clear Flop</ClearButton>}
      </BoardSection>

      <BoardSection>
        <BoardTitle>Turn (1 card)</BoardTitle>
        {!turn && (
          <CardSelector
            selectedCards={[]}
            onCardsChange={(cards) => onTurnChange(cards[0] || null)}
            maxCards={1}
            title=""
          />
        )}
        {turn && <ClearButton onClick={clearTurn}>Clear Turn</ClearButton>}
      </BoardSection>

      <BoardSection>
        <BoardTitle>River (1 card)</BoardTitle>
        {!river && (
          <CardSelector
            selectedCards={[]}
            onCardsChange={(cards) => onRiverChange(cards[0] || null)}
            maxCards={1}
            title=""
          />
        )}
        {river && <ClearButton onClick={clearRiver}>Clear River</ClearButton>}
      </BoardSection>
    </div>
  );
};

export default BoardSelector; 