import React from 'react';
import styled from 'styled-components';

const StatsContainer = styled.div`
  background: #2a2a2a;
  border-radius: 8px;
  padding: 15px;
  margin: 15px 0;
  border: 1px solid #444;
`;

const StatsHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: #fff;
  font-weight: bold;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 12px;
`;

const StatCard = styled.div`
  background: #333;
  padding: 10px;
  border-radius: 6px;
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 18px;
  font-weight: bold;
  color: #4CAF50;
  margin-bottom: 2px;
`;

const StatLabel = styled.div`
  font-size: 11px;
  color: #ccc;
`;

const ActionBreakdown = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 10px;
`;

const ActionBar = styled.div`
  flex: 1;
  background: #444;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
`;

const ActionFill = styled.div`
  height: 20px;
  background: ${props => {
    if (props.action === 'fold') return '#f44336';
    if (props.action === 'call') return '#ff9800';
    if (props.action === 'raise') return '#4CAF50';
    return '#2196F3';
  }};
  width: ${props => props.percentage}%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: white;
  font-weight: bold;
`;

const NoDataMessage = styled.div`
  text-align: center;
  color: #888;
  font-style: italic;
  padding: 20px;
`;

const SampleHands = styled.div`
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #444;
`;

const SampleHand = styled.div`
  background: #333;
  padding: 8px;
  margin: 4px 0;
  border-radius: 4px;
  font-size: 12px;
  color: #ccc;
`;

const HandStatistics = ({ handStats, isPreflop = true }) => {
  if (!handStats) {
    return (
      <StatsContainer>
        <NoDataMessage>
          No similar hands found in the dataset for this situation.
        </NoDataMessage>
      </StatsContainer>
    );
  }

  const { totalHands, actions, actionPercentages, avgProfit, winRate, sampleHands } = handStats;

  return (
    <StatsContainer>
      <StatsHeader>
        📈 {isPreflop ? 'Preflop' : 'Postflop'} Hand Statistics
        <span style={{ fontSize: '12px', color: '#888' }}>
          ({totalHands} similar hands)
        </span>
      </StatsHeader>

      <StatsGrid>
        <StatCard>
          <StatNumber>{totalHands}</StatNumber>
          <StatLabel>Total Hands</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{(winRate * 100).toFixed(1)}%</StatNumber>
          <StatLabel>Win Rate</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber style={{ color: avgProfit >= 0 ? '#4CAF50' : '#f44336' }}>
            {avgProfit >= 0 ? '+' : ''}{avgProfit.toFixed(2)}
          </StatNumber>
          <StatLabel>Avg Profit</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{handStats.handNotation}</StatNumber>
          <StatLabel>Hand Notation</StatLabel>
        </StatCard>
      </StatsGrid>

      <div style={{ marginBottom: '8px', fontSize: '12px', color: '#ccc' }}>
        Action Breakdown:
      </div>
      
      <ActionBreakdown>
        <ActionBar>
          <ActionFill 
            action="fold" 
            percentage={parseFloat(actionPercentages.fold)}
          >
            {actionPercentages.fold}%
          </ActionFill>
        </ActionBar>
        <ActionBar>
          <ActionFill 
            action="call" 
            percentage={parseFloat(actionPercentages.call)}
          >
            {actionPercentages.call}%
          </ActionFill>
        </ActionBar>
        <ActionBar>
          <ActionFill 
            action="raise" 
            percentage={parseFloat(actionPercentages.raise)}
          >
            {actionPercentages.raise}%
          </ActionFill>
        </ActionBar>
        <ActionBar>
          <ActionFill 
            action="allIn" 
            percentage={parseFloat(actionPercentages.allIn)}
          >
            {actionPercentages.allIn}%
          </ActionFill>
        </ActionBar>
      </ActionBreakdown>

      {sampleHands && sampleHands.length > 0 && (
        <SampleHands>
          <div style={{ fontSize: '12px', color: '#ccc', marginBottom: '8px' }}>
            Sample Recommendations:
          </div>
          {sampleHands.slice(0, 3).map((hand, index) => (
            <SampleHand key={index}>
              <strong>{hand.Position || hand.position}:</strong> {hand['Recommended Action'] || hand.action || hand.decision}
            </SampleHand>
          ))}
        </SampleHands>
      )}
    </StatsContainer>
  );
};

export default HandStatistics; 