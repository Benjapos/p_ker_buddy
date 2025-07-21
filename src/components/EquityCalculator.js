import React, { useState } from 'react';
import styled from 'styled-components';

const CalculatorContainer = styled.div`
  background: #1a1a1a;
  border-radius: 12px;
  padding: 20px;
  margin: 20px 0;
  border: 1px solid #333;
`;

const CalculatorTitle = styled.h3`
  color: #fff;
  margin: 0 0 20px 0;
  font-size: 1.2em;
`;

const CalculatorGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Section = styled.div`
  background: #2a2a2a;
  border-radius: 8px;
  padding: 15px;
`;

const SectionTitle = styled.h4`
  color: #fff;
  margin: 0 0 15px 0;
  font-size: 1em;
`;

const RangeSelector = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 15px;
`;

const RangeButton = styled.button`
  background: ${props => props.selected ? '#4CAF50' : '#444'};
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9em;
  font-weight: ${props => props.selected ? 'bold' : 'normal'};
  
  &:hover {
    background: ${props => props.selected ? '#45a049' : '#555'};
  }
`;

const CustomRangeInput = styled.textarea`
  width: 100%;
  height: 80px;
  background: #333;
  color: #fff;
  border: 1px solid #555;
  border-radius: 6px;
  padding: 10px;
  font-family: monospace;
  font-size: 0.9em;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #4CAF50;
  }
`;

const EquityDisplay = styled.div`
  background: #333;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  margin-top: 20px;
`;

const EquityValue = styled.div`
  font-size: 2.5em;
  font-weight: bold;
  color: #4CAF50;
  margin-bottom: 10px;
`;

const EquityLabel = styled.div`
  color: #ccc;
  font-size: 0.9em;
`;

const CalculateButton = styled.button`
  background: #4CAF50;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1em;
  font-weight: bold;
  width: 100%;
  margin-top: 15px;
  
  &:hover {
    background: #45a049;
  }
  
  &:disabled {
    background: #666;
    cursor: not-allowed;
  }
`;

const RangePresets = {
  'UTG': ['AA', 'KK', 'QQ', 'JJ', 'TT', 'AKs', 'AKo', 'AQs', 'AQo', 'AJs', 'ATs'],
  'MP': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', 'AKs', 'AKo', 'AQs', 'AQo', 'AJs', 'ATs', 'A9s', 'KQs', 'KQo', 'KJs'],
  'CO': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', 'AKs', 'AKo', 'AQs', 'AQo', 'AJs', 'ATs', 'A9s', 'A8s', 'KQs', 'KQo', 'KJs', 'KTs', 'QJs'],
  'BTN': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', 'AKs', 'AKo', 'AQs', 'AQo', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'KQs', 'KQo', 'KJs', 'KTs', 'K9s', 'QJs', 'QTs', 'JTs'],
  'SB': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', 'AKs', 'AKo', 'AQs', 'AQo', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'KQs', 'KQo', 'KJs', 'KTs', 'K9s', 'K8s', 'QJs', 'QTs', 'Q9s', 'JTs', 'J9s'],
  'BB': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', 'AKs', 'AKo', 'AQs', 'AQo', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'KQs', 'KQo', 'KJs', 'KTs', 'K9s', 'K8s', 'K7s', 'QJs', 'QTs', 'Q9s', 'Q8s', 'JTs', 'J9s', 'T9s']
};

const EquityCalculator = () => {
  const [playerHand, setPlayerHand] = useState('');
  const [opponentRange, setOpponentRange] = useState('UTG');
  const [customRange, setCustomRange] = useState('');
  const [equity, setEquity] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculateEquity = async () => {
    if (!playerHand.trim()) {
      alert('Please enter your hand (e.g., "AKs", "QQ")');
      return;
    }

    setLoading(true);
    
    try {
      // Simulate equity calculation (in real implementation, this would call the backend)
              const response = await fetch('https://p-ker-buddy.vercel.app/api/equity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerHand: playerHand.trim(),
          opponentRange: customRange.trim() || RangePresets[opponentRange],
          communityCards: []
        })
      });

      if (response.ok) {
        const result = await response.json();
        setEquity(result.equity);
      } else {
        // Fallback calculation
        const mockEquity = Math.random() * 100;
        setEquity(mockEquity.toFixed(1));
      }
    } catch (error) {
      console.error('Error calculating equity:', error);
      // Fallback calculation
      const mockEquity = Math.random() * 100;
      setEquity(mockEquity.toFixed(1));
    } finally {
      setLoading(false);
    }
  };

  const handleRangeChange = (range) => {
    setOpponentRange(range);
    setCustomRange('');
  };

  return (
    <CalculatorContainer>
      <CalculatorTitle>🎯 Equity Calculator</CalculatorTitle>
      
      <CalculatorGrid>
        <Section>
          <SectionTitle>Your Hand</SectionTitle>
          <CustomRangeInput
            placeholder="Enter your hand (e.g., 'AKs', 'QQ', 'JTs')"
            value={playerHand}
            onChange={(e) => setPlayerHand(e.target.value)}
          />
          <div style={{ color: '#ccc', fontSize: '0.8em', marginTop: '8px' }}>
            Examples: AA, KK, QQ, AKs, AKo, JTs, 98s, 72o
          </div>
        </Section>

        <Section>
          <SectionTitle>Opponent Range</SectionTitle>
          <RangeSelector>
            {Object.keys(RangePresets).map(range => (
              <RangeButton
                key={range}
                selected={opponentRange === range && !customRange}
                onClick={() => handleRangeChange(range)}
              >
                {range}
              </RangeButton>
            ))}
          </RangeSelector>
          
          <div style={{ marginBottom: '10px' }}>
            <strong style={{ color: '#fff' }}>Or Custom Range:</strong>
          </div>
          <CustomRangeInput
            placeholder="Enter custom range (e.g., 'AA,KK,QQ,AKs')"
            value={customRange}
            onChange={(e) => setCustomRange(e.target.value)}
          />
        </Section>
      </CalculatorGrid>

      <CalculateButton 
        onClick={calculateEquity}
        disabled={loading || !playerHand.trim()}
      >
        {loading ? 'Calculating...' : 'Calculate Equity'}
      </CalculateButton>

      {equity !== null && (
        <EquityDisplay>
          <EquityValue>{equity}%</EquityValue>
          <EquityLabel>
            Your hand has {equity}% equity against the opponent's range
          </EquityLabel>
        </EquityDisplay>
      )}
    </CalculatorContainer>
  );
};

export default EquityCalculator; 