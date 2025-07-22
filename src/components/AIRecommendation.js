import React from 'react';
import styled from 'styled-components';
import { useTheme } from '../App';

const RecommendationContainer = styled.div`
  background: ${props => props.theme.cardBackground};
  border-radius: 12px;
  padding: 15px;
  border: 1px solid ${props => props.theme.cardBorder};
  min-height: 180px;
  max-height: none;
  overflow-y: visible;
  transition: all 0.3s ease;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: ${props => props.theme.success};
  font-size: 1.2em;
`;

const ActionDisplay = styled.div`
  text-align: center;
  margin-bottom: 20px;
`;

const ActionButton = styled.div`
  display: inline-block;
  padding: 15px 30px;
  border-radius: 8px;
  font-size: 1.5em;
  font-weight: bold;
  text-transform: uppercase;
  color: white;
  margin-bottom: 10px;
  
  &.fold {
    background: #f44336;
  }
  
  &.call {
    background: #ff9800;
  }
  
  &.raise {
    background: #4CAF50;
  }
`;

const ConfidenceBar = styled.div`
  width: 100%;
  height: 8px;
  background: #333;
  border-radius: 4px;
  overflow: hidden;
  margin: 10px 0;
`;

const ConfidenceFill = styled.div`
  height: 100%;
  background: ${props => {
    if (props.confidence >= 80) return '#4CAF50';
    if (props.confidence >= 60) return '#ff9800';
    return '#f44336';
  }};
  width: ${props => props.confidence}%;
  transition: width 0.3s ease;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 10px;
  margin: 15px 0;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 8px;
  }
`;

const StatCard = styled.div`
  background: ${props => props.theme.inputBackground};
  border-radius: 6px;
  padding: 10px;
  text-align: center;
  border-left: 3px solid ${props => props.theme.success};
  transition: all 0.3s ease;
`;

const StatLabel = styled.div`
  color: ${props => props.theme.textSecondary};
  font-size: 0.9em;
  margin-bottom: 5px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: color 0.3s ease;
`;

const StatValue = styled.div`
  color: ${props => props.theme.text};
  font-weight: bold;
  font-size: 1.1em;
  transition: color 0.3s ease;
`;

const EquityValue = styled(StatValue)`
  color: ${props => props.theme.success};
`;

const ReasoningBox = styled.div`
  background: ${props => props.theme.inputBackground};
  border-radius: 6px;
  padding: 12px;
  margin-top: 15px;
  border-left: 3px solid ${props => props.theme.primary};
  transition: all 0.3s ease;
`;

const ReasoningTitle = styled.div`
  color: ${props => props.theme.primary};
  font-weight: bold;
  margin-bottom: 10px;
  font-size: 1.1em;
  transition: color 0.3s ease;
`;

const ReasoningText = styled.div`
  color: ${props => props.theme.textSecondary};
  line-height: 1.6;
  font-size: 0.95em;
  transition: color 0.3s ease;
`;

const AnalyzeButton = styled.button`
  background: ${props => props.theme.buttonPrimary};
  color: ${props => props.theme.buttonText};
  border: none;
  padding: 12px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1em;
  font-weight: bold;
  width: 100%;
  margin-top: 12px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px ${props => props.theme.shadow};
  }
  
  &:disabled {
    background: ${props => props.theme.border};
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  
  @media (max-width: 768px) {
    padding: 10px 15px;
    font-size: 0.9em;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  color: ${props => props.theme.textSecondary};
  padding: 40px 20px;
  font-style: italic;
  transition: color 0.3s ease;
`;

const RaiseAmount = styled.div`
  color: ${props => props.theme.success};
  font-weight: bold;
  margin-top: 15px;
  font-size: 1.3em;
  background: ${props => props.theme.inputBackground};
  padding: 12px;
  border-radius: 8px;
  border: 2px solid ${props => props.theme.success};
  text-align: center;
  transition: all 0.3s ease;
`;

const RaiseSizing = styled.div`
  color: ${props => props.theme.text};
  font-size: 0.9em;
  margin-top: 8px;
  opacity: 0.8;
  transition: color 0.3s ease;
`;

const AIRecommendation = ({ recommendation, loading, onAnalyze, canAnalyze, isPreflop }) => {
  if (loading) {
    return (
      <RecommendationContainer>
        <LoadingSpinner>
          🧠 AI is analyzing your hand...
        </LoadingSpinner>
      </RecommendationContainer>
    );
  }

  if (!recommendation) {
    return (
      <RecommendationContainer>
        <EmptyState>
          {canAnalyze 
            ? "Click 'Get AI Recommendation' to analyze your hand"
            : "Please select your hole cards to get a recommendation"
          }
        </EmptyState>
        {canAnalyze && (
          <AnalyzeButton onClick={onAnalyze}>
            Get AI Recommendation
          </AnalyzeButton>
        )}
      </RecommendationContainer>
    );
  }

  const { action, confidence, raiseAmount, handStrength, equity, potOdds, impliedOdds, ev, reasoning } = recommendation;

  return (
    <RecommendationContainer>
      <ActionDisplay>
        <ActionButton className={action}>
          {action}
        </ActionButton>
        <div style={{ color: '#ccc', marginBottom: '10px' }}>
          Confidence: {confidence}%
        </div>
        <ConfidenceBar>
          <ConfidenceFill confidence={confidence} />
        </ConfidenceBar>
        {action === 'raise' && raiseAmount && (
          <RaiseAmount>
            💰 RAISE TO: ${raiseAmount}
            <RaiseSizing>
              ({recommendation.bigBlind ? (raiseAmount / recommendation.bigBlind).toFixed(1) : 'N/A'} big blinds)
            </RaiseSizing>
          </RaiseAmount>
        )}
      </ActionDisplay>

      <StatsGrid>
        <StatCard>
          <StatLabel>Hand Strength</StatLabel>
          <StatValue>{handStrength}</StatValue>
        </StatCard>
        
        <StatCard>
          <StatLabel>Equity</StatLabel>
          <EquityValue>{equity}%</EquityValue>
        </StatCard>
        
        {!isPreflop && potOdds !== null && (
          <StatCard>
            <StatLabel>Pot Odds</StatLabel>
            <StatValue>{potOdds}%</StatValue>
          </StatCard>
        )}
        
        {!isPreflop && impliedOdds !== null && (
          <StatCard>
            <StatLabel>Implied Odds</StatLabel>
            <StatValue>{impliedOdds}%</StatValue>
          </StatCard>
        )}
        
        <StatCard>
          <StatLabel>Expected Value</StatLabel>
          <StatValue style={{ color: ev >= 0 ? '#4CAF50' : '#f44336' }}>
            ${ev}
          </StatValue>
        </StatCard>
      </StatsGrid>

      <ReasoningBox>
        <ReasoningTitle>🤖 AI Reasoning</ReasoningTitle>
        <ReasoningText>{reasoning}</ReasoningText>
      </ReasoningBox>

      <AnalyzeButton onClick={onAnalyze}>
        {isPreflop ? '🔄 Re-analyze Preflop' : '🔄 Re-analyze Hand'}
      </AnalyzeButton>
    </RecommendationContainer>
  );
};

export default AIRecommendation; 