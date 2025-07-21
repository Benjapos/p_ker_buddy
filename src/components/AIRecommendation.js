import React from 'react';
import styled from 'styled-components';

const RecommendationContainer = styled.div`
  background: #1a1a1a;
  border-radius: 12px;
  padding: 15px;
  border: 1px solid #333;
  min-height: 180px;
  max-height: none;
  overflow-y: visible;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #4CAF50;
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
  background: #2a2a2a;
  border-radius: 6px;
  padding: 10px;
  text-align: center;
  border-left: 3px solid #4CAF50;
`;

const StatLabel = styled.div`
  color: #ccc;
  font-size: 0.9em;
  margin-bottom: 5px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StatValue = styled.div`
  color: #fff;
  font-size: 1.2em;
  font-weight: bold;
`;

const EquityValue = styled(StatValue)`
  color: #4CAF50;
`;

const ReasoningBox = styled.div`
  background: #2a2a2a;
  border-radius: 6px;
  padding: 12px;
  margin-top: 15px;
  border-left: 3px solid #2196F3;
`;

const ReasoningTitle = styled.div`
  color: #2196F3;
  font-weight: bold;
  margin-bottom: 10px;
  font-size: 1.1em;
`;

const ReasoningText = styled.div`
  color: #ccc;
  line-height: 1.6;
  font-size: 0.95em;
`;

const AnalyzeButton = styled.button`
  background: #4CAF50;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1em;
  font-weight: bold;
  width: 100%;
  margin-top: 12px;
  transition: background 0.2s ease;
  
  &:hover {
    background: #45a049;
  }
  
  &:disabled {
    background: #666;
    cursor: not-allowed;
  }
  
  @media (max-width: 768px) {
    padding: 10px 15px;
    font-size: 0.9em;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  color: #666;
  padding: 40px 20px;
  font-style: italic;
`;

const RaiseAmount = styled.div`
  color: #4CAF50;
  font-weight: bold;
  margin-top: 15px;
  font-size: 1.3em;
  background: #2a2a2a;
  padding: 12px;
  border-radius: 8px;
  border: 2px solid #4CAF50;
  text-align: center;
`;

const RaiseSizing = styled.div`
  color: #fff;
  font-size: 0.9em;
  margin-top: 8px;
  opacity: 0.8;
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
        
        <StatCard>
          <StatLabel>Pot Odds</StatLabel>
          <StatValue>{potOdds}%</StatValue>
        </StatCard>
        
        <StatCard>
          <StatLabel>Implied Odds</StatLabel>
          <StatValue>{impliedOdds}%</StatValue>
        </StatCard>
        
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