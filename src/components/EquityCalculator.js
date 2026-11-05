import React, { useState } from 'react';
import styled from 'styled-components';
import { calculateEquity, notationToCombos, rangeToCombos } from '../utils/equity';

const CalculatorContainer = styled.div`
  background: ${props => props.theme.cardBackground};
  border-radius: 12px;
  padding: 20px;
  margin: 0;
  border: 1px solid ${props => props.theme.cardBorder};
`;

const CalculatorTitle = styled.h3`
  font-family: ${props => props.theme.serif};
  color: ${props => props.theme.primary};
  margin: 0 0 14px 0;
  font-size: 1.4rem;
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
  background: ${props => props.theme.buttonSecondary};
  border: 1px solid ${props => props.theme.border};
  border-radius: 8px;
  padding: 15px;
`;

const SectionTitle = styled.h4`
  color: ${props => props.theme.primary};
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
  background: ${props => props.selected ? props.theme.primary : props.theme.inputBackground};
  color: ${props => props.selected ? '#fff' : props.theme.text};
  border: 1px solid ${props => props.selected ? props.theme.primary : props.theme.inputBorder};
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9em;
  font-weight: ${props => props.selected ? 'bold' : 'normal'};
  
  &:hover {
    background: ${props => props.selected ? props.theme.secondary : props.theme.buttonSecondary};
  }
`;

const CustomRangeInput = styled.textarea`
  width: 100%;
  height: 80px;
  background: ${props => props.theme.inputBackground};
  color: ${props => props.theme.text};
  border: 1px solid ${props => props.theme.inputBorder};
  border-radius: 6px;
  padding: 10px;
  font-family: monospace;
  font-size: 0.9em;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary};
  }
`;

const EquityDisplay = styled.div`
  background: ${props => props.theme.buttonSecondary};
  border: 1px solid ${props => props.theme.border};
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  margin-top: 20px;
`;

const EquityValue = styled.div`
  font-size: 2.5em;
  font-weight: bold;
  color: ${props => props.theme.success};
  margin-bottom: 10px;
`;

const EquityLabel = styled.div`
  color: ${props => props.theme.textSecondary};
  font-size: 0.9em;
`;

const CalculateButton = styled.button`
  background: ${props => props.theme.primary};
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
    background: ${props => props.theme.secondary};
  }
  
  &:disabled {
    background: ${props => props.theme.inputBorder};
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

const RangeDisplay = styled.div`
  background: ${props => props.theme.inputBackground};
  border-radius: 6px;
  padding: 10px;
  margin-top: 10px;
  font-family: monospace;
  font-size: 0.85em;
  color: ${props => props.theme.textSecondary};
  max-height: 100px;
  overflow-y: auto;
  border: 1px solid ${props => props.theme.inputBorder};
`;

const EquityCalculator = () => {
  const [playerHand, setPlayerHand] = useState('');
  const [opponentRange, setOpponentRange] = useState('UTG');
  const [customRange, setCustomRange] = useState('');
  const [equity, setEquity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const runCalculation = () => {
    setError('');
    setEquity(null);

    const hero = notationToCombos(playerHand);
    if (hero.length === 0) {
      setError('Enter your hand in poker notation, for example AKs, QQ or 72o.');
      return;
    }

    const { combos, invalid } = rangeToCombos(customRange.trim() || RangePresets[opponentRange]);
    if (invalid.length > 0) {
      setError(`Could not read these range entries: ${invalid.join(', ')}`);
      return;
    }
    if (combos.length === 0) {
      setError('The opponent range is empty.');
      return;
    }

    setLoading(true);
    // Let the "Calculating..." state paint before the simulation blocks the thread.
    setTimeout(() => {
      try {
        setEquity(calculateEquity({ heroCombos: hero, opponents: [combos], iterations: 20000 }));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }, 20);
  };

  const handleRangeChange = (range) => {
    setOpponentRange(range);
    setCustomRange('');
  };

  return (
    <CalculatorContainer>
      <CalculatorTitle>Equity Calculator</CalculatorTitle>
      <div style={{ color: '#5f675f', fontSize: '0.9em', marginBottom: '20px', lineHeight: '1.4' }}>
        Estimate your hand's equity (winning percentage) against an opponent's range by simulating 20,000 hands. This helps you make better decisions by knowing how often your hand will win against different opponent types. Enter your hand in poker notation (e.g., 'AKs' for Ace-King suited) and select or define your opponent's range.
      </div>
      
      <CalculatorGrid>
        <Section>
          <SectionTitle>Your Hand</SectionTitle>
          <CustomRangeInput
            placeholder="Enter your hand (e.g., 'AKs', 'QQ', 'JTs')"
            value={playerHand}
            onChange={(e) => setPlayerHand(e.target.value)}
            aria-label="Your hand"
          />
          <div style={{ color: '#5f675f', fontSize: '0.8em', marginTop: '8px' }}>
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
          
          {/* Show selected range */}
          {!customRange && opponentRange && (
            <div style={{ marginTop: '10px' }}>
              <div style={{ color: '#1f2a22', fontSize: '0.9em', marginBottom: '5px' }}>
                <strong>Selected Range ({opponentRange}):</strong>
              </div>
              <RangeDisplay>
                {RangePresets[opponentRange].join(', ')}
              </RangeDisplay>
            </div>
          )}
          
          <div style={{ marginBottom: '10px', marginTop: '15px' }}>
            <strong style={{ color: '#1f2a22' }}>Or Custom Range:</strong>
          </div>
          <CustomRangeInput
            placeholder="Enter custom range (e.g., 'AA,KK,QQ,AKs')"
            value={customRange}
            onChange={(e) => setCustomRange(e.target.value)}
            aria-label="Custom opponent range"
          />
        </Section>
      </CalculatorGrid>

      <CalculateButton 
        onClick={runCalculation}
        disabled={loading || !playerHand.trim()}
      >
        {loading ? 'Calculating...' : 'Calculate Equity'}
      </CalculateButton>

      {error && (
        <div role="alert" style={{ color: '#b5483a', marginTop: '15px', textAlign: 'center' }}>{error}</div>
      )}

      {equity !== null && (
        <EquityDisplay aria-live="polite">
          <EquityValue>{equity.equity.toFixed(1)}%</EquityValue>
          <EquityLabel>
            Your hand's equity against the opponent's range
            <br />
            Wins {equity.win.toFixed(1)}% · Ties (your share) {equity.tie.toFixed(1)}% · Loses {equity.lose.toFixed(1)}%
            <br />
            Monte Carlo estimate from {equity.iterations.toLocaleString()} simulated hands, so expect about ±0.7%
          </EquityLabel>
        </EquityDisplay>
      )}
    </CalculatorContainer>
  );
};

export default EquityCalculator; 