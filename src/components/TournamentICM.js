import React, { useState } from 'react';
import styled from 'styled-components';

const ICMContainer = styled.div`
  background: #1a1a1a;
  border-radius: 12px;
  padding: 20px;
  margin: 20px 0;
  border: 1px solid #333;
`;

const ICMTitle = styled.h3`
  color: #fff;
  margin: 0 0 20px 0;
  font-size: 1.2em;
`;

const ICMGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const PlayerInput = styled.div`
  background: #2a2a2a;
  border-radius: 8px;
  padding: 15px;
`;

const PlayerLabel = styled.label`
  color: #fff;
  font-weight: bold;
  display: block;
  margin-bottom: 8px;
`;

const PlayerInputField = styled.input`
  width: 100%;
  padding: 10px;
  background: #333;
  color: #fff;
  border: 1px solid #555;
  border-radius: 6px;
  font-size: 1em;
  
  &:focus {
    outline: none;
    border-color: #4CAF50;
  }
`;

const ICMResults = styled.div`
  background: #2a2a2a;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
`;

const ResultsTitle = styled.h4`
  color: #4CAF50;
  margin: 0 0 15px 0;
  font-size: 1.1em;
`;

const ResultsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ResultCard = styled.div`
  background: #333;
  border-radius: 6px;
  padding: 12px;
  text-align: center;
  border-left: 4px solid #4CAF50;
`;

const ResultLabel = styled.div`
  color: #ccc;
  font-size: 0.9em;
  margin-bottom: 5px;
`;

const ResultValue = styled.div`
  color: #fff;
  font-size: 1.3em;
  font-weight: bold;
`;

const ICMValue = styled(ResultValue)`
  color: #4CAF50;
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

const ICMAdvice = styled.div`
  background: #2a2a2a;
  border-radius: 8px;
  padding: 15px;
  margin-top: 15px;
  border-left: 4px solid #2196F3;
`;

const AdviceTitle = styled.div`
  color: #2196F3;
  font-weight: bold;
  margin-bottom: 10px;
`;

const AdviceText = styled.div`
  color: #ccc;
  line-height: 1.6;
`;

const TournamentICM = () => {
  const [playerStacks, setPlayerStacks] = useState(['', '', '', '']);
  const [prizePool, setPrizePool] = useState('');
  const [icmResults, setIcmResults] = useState(null);
  const [icmAdvice, setIcmAdvice] = useState('');

  const calculateICM = () => {
    const stacks = playerStacks.map(stack => parseInt(stack) || 0).filter(stack => stack > 0);
    const totalPrize = parseInt(prizePool) || 0;
    
    if (stacks.length < 2 || totalPrize === 0) {
      alert('Please enter valid stack sizes and prize pool');
      return;
    }

    // Simple ICM calculation (in production, use more sophisticated algorithm)
    const totalChips = stacks.reduce((sum, stack) => sum + stack, 0);
    const icmValues = stacks.map(stack => (stack / totalChips) * totalPrize);
    
    setIcmResults({
      stacks,
      icmValues,
      totalChips,
      totalPrize
    });

    // Generate ICM-based advice
    generateICMAdvice(stacks, icmValues, totalPrize);
  };

  const generateICMAdvice = (stacks, icmValues, totalPrize) => {
    const playerStack = stacks[0]; // Assuming current player is first
    const playerICM = icmValues[0];
    const avgStack = stacks.reduce((sum, stack) => sum + stack, 0) / stacks.length;
    
    let advice = '';
    
    if (playerStack > avgStack * 1.5) {
      advice = 'You have a large stack. Play more conservatively to preserve your ICM value. Avoid marginal spots and focus on value betting strong hands.';
    } else if (playerStack < avgStack * 0.5) {
      advice = 'You have a short stack. Look for opportunities to shove with decent hands. Avoid calling with marginal hands - either fold or shove.';
    } else {
      advice = 'You have a medium stack. Play standard poker but be aware of ICM pressure. Avoid calling with weak hands when there are short stacks at the table.';
    }
    
    setIcmAdvice(advice);
  };

  const handleStackChange = (index, value) => {
    const newStacks = [...playerStacks];
    newStacks[index] = value;
    setPlayerStacks(newStacks);
  };

  const addPlayer = () => {
    if (playerStacks.length < 9) {
      setPlayerStacks([...playerStacks, '']);
    }
  };

  const removePlayer = () => {
    if (playerStacks.length > 2) {
      setPlayerStacks(playerStacks.slice(0, -1));
    }
  };

  return (
    <ICMContainer>
      <ICMTitle>🏆 Tournament ICM Calculator</ICMTitle>
      
      <ICMGrid>
        {playerStacks.map((stack, index) => (
          <PlayerInput key={index}>
            <PlayerLabel>Player {index + 1} Stack</PlayerLabel>
            <PlayerInputField
              type="number"
              placeholder="Chips"
              value={stack}
              onChange={(e) => handleStackChange(index, e.target.value)}
            />
          </PlayerInput>
        ))}
        
        <PlayerInput>
          <PlayerLabel>Prize Pool ($)</PlayerLabel>
          <PlayerInputField
            type="number"
            placeholder="Total prize money"
            value={prizePool}
            onChange={(e) => setPrizePool(e.target.value)}
          />
        </PlayerInput>
      </ICMGrid>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <CalculateButton 
          onClick={addPlayer}
          style={{ width: 'auto', margin: 0 }}
        >
          + Add Player
        </CalculateButton>
        <CalculateButton 
          onClick={removePlayer}
          style={{ width: 'auto', margin: 0, background: '#f44336' }}
        >
          - Remove Player
        </CalculateButton>
      </div>

      <CalculateButton onClick={calculateICM}>
        Calculate ICM Values
      </CalculateButton>

      {icmResults && (
        <ICMResults>
          <ResultsTitle>📊 ICM Results</ResultsTitle>
          <ResultsGrid>
            {icmResults.stacks.map((stack, index) => (
              <ResultCard key={index}>
                <ResultLabel>Player {index + 1}</ResultLabel>
                <ResultValue>{stack.toLocaleString()} chips</ResultValue>
                <ICMValue>${icmResults.icmValues[index].toFixed(2)}</ICMValue>
              </ResultCard>
            ))}
            <ResultCard>
              <ResultLabel>Total Chips</ResultLabel>
              <ResultValue>{icmResults.totalChips.toLocaleString()}</ResultValue>
            </ResultCard>
            <ResultCard>
              <ResultLabel>Prize Pool</ResultLabel>
              <ResultValue>${icmResults.totalPrize.toLocaleString()}</ResultValue>
            </ResultCard>
          </ResultsGrid>
        </ICMResults>
      )}

      {icmAdvice && (
        <ICMAdvice>
          <AdviceTitle>🎯 ICM Strategy Advice</AdviceTitle>
          <AdviceText>{icmAdvice}</AdviceText>
        </ICMAdvice>
      )}
    </ICMContainer>
  );
};

export default TournamentICM; 