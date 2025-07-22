import React, { useState } from 'react';
import styled from 'styled-components';
import { useTheme } from '../App';

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(13, 1fr);
  gap: 5px;
  margin-top: 15px;
  
  @media (max-width: 768px) {
    gap: 4px;
    margin-top: 12px;
  }
  
  @media (max-width: 480px) {
    gap: 3px;
    margin-top: 10px;
  }
`;

const Card = styled.div`
  width: 40px;
  height: 56px;
  border: 2px solid ${props => props.selected ? props.theme.success : props.theme.border};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  cursor: pointer;
  background: ${props => props.selected ? props.theme.success : props.theme.cardBackground};
  color: ${props => props.selected ? 'white' : props.suit === '♥' || props.suit === '♦' ? 'red' : props.theme.text};
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px ${props => props.theme.shadow};
  }
  
  @media (max-width: 768px) {
    width: 36px;
    height: 50px;
    font-size: 12px;
    border-radius: 6px;
  }
  
  @media (max-width: 480px) {
    width: 32px;
    height: 45px;
    font-size: 11px;
    border-radius: 5px;
  }
`;

const SuitGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 5px;
  margin-top: 15px;
  
  @media (max-width: 768px) {
    gap: 4px;
    margin-top: 12px;
  }
  
  @media (max-width: 480px) {
    gap: 3px;
    margin-top: 10px;
  }
`;

const SuitCard = styled.div`
  width: 40px;
  height: 56px;
  border: 2px solid ${props => props.selected ? props.theme.success : props.theme.border};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  cursor: pointer;
  background: ${props => props.selected ? props.theme.success : props.theme.cardBackground};
  color: ${props => props.selected ? 'white' : props.suit === '♥' || props.suit === '♦' ? 'red' : props.theme.text};
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px ${props => props.theme.shadow};
  }
  
  @media (max-width: 768px) {
    width: 36px;
    height: 50px;
    font-size: 18px;
    border-radius: 6px;
  }
  
  @media (max-width: 480px) {
    width: 32px;
    height: 45px;
    font-size: 16px;
    border-radius: 5px;
  }
`;

const SelectedCards = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 15px;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    gap: 8px;
    margin-top: 12px;
    justify-content: center;
  }
  
  @media (max-width: 480px) {
    gap: 6px;
    margin-top: 10px;
  }
`;

const SelectedCard = styled.div`
  width: 50px;
  height: 70px;
  border: 2px solid #4CAF50;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 16px;
  background: #4CAF50;
  color: white;
  position: relative;
  
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

const CardSelector = ({ selectedCards, onCardsChange, maxCards, title }) => {
  const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  const suits = ['♠', '♥', '♦', '♣'];
  const [selectedRank, setSelectedRank] = useState(null);
  const [selectedSuit, setSelectedSuit] = useState(null);

  const handleCardClick = (rank, suit) => {
    const card = `${rank}${suit}`;
    const isSelected = selectedCards.some(c => c === card);
    
    if (isSelected) {
      onCardsChange(selectedCards.filter(c => c !== card));
    } else if (selectedCards.length < maxCards) {
      onCardsChange([...selectedCards, card]);
    }
  };

  const removeCard = (card) => {
    onCardsChange(selectedCards.filter(c => c !== card));
  };

  const handleRankClick = (rank) => {
    console.log('Rank clicked:', rank);
    setSelectedRank(rank);
    setSelectedSuit(null);
  };

  const handleSuitClick = (suit) => {
    console.log('Suit clicked:', suit, 'Selected rank:', selectedRank);
    setSelectedSuit(suit);
    if (selectedRank) {
      handleCardClick(selectedRank, suit);
      setSelectedRank(null);
      setSelectedSuit(null);
    }
  };

  return (
    <div>
      <h3>{title}</h3>
      
      <SelectedCards>
        {selectedCards.map((card, index) => (
          <SelectedCard key={index}>
            {card}
            <RemoveButton onClick={() => removeCard(card)}>×</RemoveButton>
          </SelectedCard>
        ))}
      </SelectedCards>

      <div>
        <h4>Select Rank:</h4>
        <CardGrid>
          {ranks.map(rank => (
            <Card
              key={rank}
              selected={selectedRank === rank}
              onClick={() => handleRankClick(rank)}
            >
              {rank}
            </Card>
          ))}
        </CardGrid>
      </div>

      <div>
        <h4>Select Suit:</h4>
        <SuitGrid>
          {suits.map(suit => (
            <SuitCard
              key={suit}
              suit={suit}
              selected={selectedSuit === suit}
              onClick={() => handleSuitClick(suit)}
            >
              {suit}
            </SuitCard>
          ))}
        </SuitGrid>
      </div>

      {selectedRank && (
        <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
          <p>Selected Rank: <strong>{selectedRank}</strong></p>
          <p>Now click a suit to add the card!</p>
        </div>
      )}

      <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
        Selected: {selectedCards.length}/{maxCards}
      </p>
    </div>
  );
};

export default CardSelector; 