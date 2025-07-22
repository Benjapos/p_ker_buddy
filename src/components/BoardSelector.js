import React from 'react';
import styled from 'styled-components';
import CardSelector from './CardSelector';

const BoardSection = styled.div`
  margin-bottom: 20px;
`;

const BoardTitle = styled.h4`
  color: #1e3c72;
  margin-bottom: 10px;
  
  @media (max-width: 768px) {
    font-size: 18px;
    margin-bottom: 8px;
  }
  
  @media (max-width: 480px) {
    font-size: 16px;
    margin-bottom: 6px;
  }
`;

const BoardCards = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 10px;
  flex-wrap: wrap;
  align-items: center;
  
  @media (max-width: 768px) {
    gap: 6px;
    justify-content: center;
  }
  
  @media (max-width: 480px) {
    gap: 4px;
  }
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
  
  @media (max-width: 768px) {
    width: 45px;
    height: 63px;
    font-size: 14px;
    border-radius: 8px;
  }
  
  @media (max-width: 480px) {
    width: 40px;
    height: 56px;
    font-size: 12px;
    border-radius: 6px;
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
  
  @media (max-width: 768px) {
    width: 18px;
    height: 18px;
    font-size: 10px;
    top: -6px;
    right: -6px;
  }
  
  @media (max-width: 480px) {
    width: 16px;
    height: 16px;
    font-size: 9px;
    top: -5px;
    right: -5px;
  }
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
  
  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 13px;
    margin-top: 8px;
  }
  
  @media (max-width: 480px) {
    padding: 5px 10px;
    font-size: 12px;
    margin-top: 6px;
  }
`;

const PreflopMessage = styled.div`
  text-align: center;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 10px;
  margin-bottom: 20px;
  border: 2px dashed #dee2e6;
  
  @media (max-width: 768px) {
    padding: 16px;
    margin-bottom: 16px;
  }
  
  @media (max-width: 480px) {
    padding: 12px;
    margin-bottom: 12px;
  }
  
  h4 {
    color: #6c757d;
    margin: 0 0 10px 0;
    
    @media (max-width: 768px) {
      font-size: 16px;
    }
    
    @media (max-width: 480px) {
      font-size: 14px;
    }
  }
  
  p {
    color: #6c757d;
    margin: 0;
    font-size: 14px;
    
    @media (max-width: 768px) {
      font-size: 13px;
    }
    
    @media (max-width: 480px) {
      font-size: 12px;
    }
  }
`;

const BoardSelector = ({ flop, turn, river, onFlopChange, onTurnChange, onRiverChange, disabled = false }) => {
  const clearFlop = () => onFlopChange([]);
  const clearTurn = () => onTurnChange(null);
  const clearRiver = () => onRiverChange(null);

  const removeFlopCard = (card) => {
    onFlopChange(flop.filter(c => c !== card));
  };

  // Debug logging
  console.log('BoardSelector - flop:', flop, 'turn:', turn, 'river:', river);

  return (
    <div style={{ opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? 'none' : 'auto' }}>
      {disabled && (
        <PreflopMessage>
          <h4>🃏 Preflop Mode</h4>
          <p>
            Community cards are not available in preflop mode. Switch to Postflop to analyze with community cards.
          </p>
        </PreflopMessage>
      )}

      {/* Unified Community Cards Display - Only Turn and River */}
      {(turn || river) && (
        <BoardSection>
          <BoardTitle>Community Cards</BoardTitle>
          <BoardCards>
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
            selectedCards={flop}
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