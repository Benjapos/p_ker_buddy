import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const HistoryContainer = styled.div`
  background: ${props => props.theme.cardBackground};
  border-radius: 12px;
  padding: 20px;
  margin: 0;
  border: 1px solid ${props => props.theme.cardBorder};
`;

const HistoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const HistoryTitle = styled.h3`
  font-family: ${props => props.theme.serif};
  color: ${props => props.theme.primary};
  margin: 0;
  font-size: 1.4rem;
`;

const ClearButton = styled.button`
  background: #b5483a;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9em;
  
  &:hover {
    background: #8f3a2f;
  }
`;

const HistoryList = styled.div`
  max-height: 400px;
  overflow-y: auto;
`;

const HistoryItem = styled.div`
  background: ${props => props.theme.buttonSecondary};
  border: 1px solid ${props => props.theme.border};
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
  border-left: 4px solid #1b5e3a;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.theme.inputBackground};
    transform: translateX(5px);
  }
  
  &.fold {
    border-left-color: #b5483a;
  }
  
  &.call {
    border-left-color: #c39a2e;
  }
  
  &.raise {
    border-left-color: #1b5e3a;
  }
`;

const HandInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const HandCards = styled.div`
  color: ${props => props.theme.text};
  font-weight: bold;
  font-size: 1.1em;
`;

const ActionBadge = styled.span`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8em;
  font-weight: bold;
  text-transform: uppercase;
  
  &.fold {
    background: #b5483a;
    color: white;
  }
  
  &.call {
    background: #c39a2e;
    color: #1f2a22;
  }
  
  &.raise {
    background: #1b5e3a;
    color: white;
  }
`;

const HandDetails = styled.div`
  color: ${props => props.theme.text};
  font-size: 0.9em;
  line-height: 1.4;
`;

const EquityDisplay = styled.span`
  color: #1b5e3a;
  font-weight: bold;
`;

const Timestamp = styled.div`
  color: ${props => props.theme.textSecondary};
  font-size: 0.8em;
  margin-top: 8px;
`;

const EmptyState = styled.div`
  text-align: center;
  color: ${props => props.theme.textSecondary};
  padding: 40px 20px;
  font-style: italic;
`;

const HandHistory = ({ currentHand, onLoadHand }) => {
  const [handHistory, setHandHistory] = useState([]);

  // Load hand history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('pokerHandHistory');
    if (savedHistory) {
      try {
        setHandHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Error loading hand history:', error);
        setHandHistory([]);
      }
    }
  }, []);

  // Save hand history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('pokerHandHistory', JSON.stringify(handHistory));
  }, [handHistory]);

  // Add current hand to history when it's analyzed
  useEffect(() => {
    if (currentHand && currentHand.timestamp) {
      const newHand = {
        ...currentHand,
        id: Date.now(),
        timestamp: new Date().toISOString()
      };
      
      setHandHistory(prev => [newHand, ...prev.slice(0, 49)]); // Keep last 50 hands
    }
  }, [currentHand]);

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear all hand history?')) {
      setHandHistory([]);
      localStorage.removeItem('pokerHandHistory');
    }
  };

  const loadHand = (hand) => {
    if (onLoadHand) {
      onLoadHand(hand);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const formatHandCards = (holeCards) => {
    if (!holeCards || holeCards.length !== 2) {
      return 'Invalid hand';
    }
    return `${holeCards[0]} ${holeCards[1]}`;
  };

  const formatCommunityCards = (flop, turn, river) => {
    const cards = [...(flop || []), ...(turn ? [turn] : []), ...(river ? [river] : [])];
    return cards.length > 0 ? cards.join(' ') : 'Pre-flop';
  };

    return (
    <HistoryContainer>
      <HistoryHeader>
        <HistoryTitle>Hand History ({handHistory.length})</HistoryTitle>
        {handHistory.length > 0 && (
          <ClearButton onClick={clearHistory}>
            Clear All
          </ClearButton>
        )}
              </HistoryHeader>
      <div style={{ color: '#5f675f', fontSize: '0.9em', marginBottom: '20px', lineHeight: '1.4' }}>
        Track your poker decisions and learn from your history. Each analyzed hand is automatically saved here, showing your cards, the action taken, and the reasoning behind it. Click on any hand to reload it for further analysis or review.
      </div>

      <HistoryList>
        {handHistory.length === 0 ? (
          <EmptyState>
            No hands analyzed yet. Start playing to build your history!
          </EmptyState>
        ) : (
          handHistory.map((hand) => (
            <HistoryItem 
              key={hand.id} 
              className={hand.action}
              onClick={() => loadHand(hand)}
            >
              <HandInfo>
                <HandCards>
                  {formatHandCards(hand.holeCards)}
                </HandCards>
                <ActionBadge className={hand.action}>
                  {hand.action}
                </ActionBadge>
              </HandInfo>
              
              <HandDetails>
                <div>
                  <strong>Community:</strong> {formatCommunityCards(hand.flop, hand.turn, hand.river)}
                </div>
                <div>
                  <strong>Position:</strong> {hand.position} | 
                  <strong> Players:</strong> {hand.numPlayers} | 
                  <strong> Pot:</strong> ${hand.potSize}
                </div>
                <div>
                  <strong>Equity:</strong> <EquityDisplay>{hand.equity}%</EquityDisplay> | 
                  <strong> EV:</strong> ${hand.ev}
                </div>
                <div>
                  <strong>Reasoning:</strong> {hand.reasoning}
                </div>
              </HandDetails>
              
              <Timestamp>
                {formatTimestamp(hand.timestamp)}
              </Timestamp>
            </HistoryItem>
          ))
        )}
      </HistoryList>
    </HistoryContainer>
  );
};

export default HandHistory; 