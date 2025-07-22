import React, { useState } from 'react';
import styled from 'styled-components';
import CardSelector from './components/CardSelector';
import BoardSelector from './components/BoardSelector';
import GameInfo from './components/GameInfo';
import AIRecommendation from './components/AIRecommendation';
import TestInterface from './components/TestInterface';
import HandHistory from './components/HandHistory';
import EquityCalculator from './components/EquityCalculator';
// import TournamentICM from './components/TournamentICM';

import { analyzeGTORange, getGTOAdvice } from './utils/pokerLogic';
import { mockAnalyzeHand } from './mockBackend';

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  padding: 20px;
  font-family: 'Inter', sans-serif;
`;

const MainContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Header = styled.h1`
  text-align: center;
  color: #1e3c72;
  margin-bottom: 10px;
  font-size: 2.5rem;
  font-weight: 700;
`;

const SubHeader = styled.h2`
  text-align: center;
  color: #666;
  margin-bottom: 30px;
  font-size: 1.2rem;
  font-weight: 400;
`;

const GameTypeBadge = styled.div`
  display: inline-block;
  background: linear-gradient(45deg, #ff6b6b, #ee5a24);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  margin-left: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

const PreflopToggle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  gap: 15px;
`;

const ToggleButton = styled.button`
  background: ${props => props.active ? 'linear-gradient(45deg, #4CAF50, #45a049)' : '#f0f0f0'};
  color: ${props => props.active ? 'white' : '#666'};
  border: 2px solid ${props => props.active ? '#4CAF50' : '#ddd'};
  padding: 10px 20px;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.active ? 'linear-gradient(45deg, #45a049, #4CAF50)' : '#e0e0e0'};
    transform: translateY(-1px);
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  width: 100%;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Section = styled.div`
  background: white;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
`;

const DevToggle = styled.button`
  position: fixed;
  top: 20px;
  right: 20px;
  background: #ffc107;
  color: #000;
  border: none;
  padding: 10px 15px;
  border-radius: 25px;
  cursor: pointer;
  font-weight: bold;
  z-index: 1000;
  
  &:hover {
    background: #e0a800;
  }
`;

const TabContainer = styled.div`
  display: flex;
  justify-content: center;
  margin: 20px 0;
  gap: 10px;
  width: 100%;
  
  @media (max-width: 768px) {
    flex-wrap: wrap;
  }
`;

const TabButton = styled.button`
  background: ${props => props.active ? '#4CAF50' : '#333'};
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.active ? '#45a049' : '#444'};
  }
  
  @media (max-width: 768px) {
    padding: 10px 15px;
    font-size: 0.9em;
  }
`;

function App() {
  const [holeCards, setHoleCards] = useState([]);
  const [flop, setFlop] = useState([]);
  const [turn, setTurn] = useState(null);
  const [river, setRiver] = useState(null);
  const [numPlayers, setNumPlayers] = useState(6);
  const [position, setPosition] = useState('middle');
  const [potSize, setPotSize] = useState(3);
  const [betSize, setBetSize] = useState(0);
  const [smallBlind, setSmallBlind] = useState(1);
  const [bigBlind, setBigBlind] = useState(2);
  const [stackSize, setStackSize] = useState(1000);
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showTestInterface, setShowTestInterface] = useState(false);
  const [isPreflop, setIsPreflop] = useState(true);
  const [activeTab, setActiveTab] = useState('main');


  const handlePreflopToggle = (preflop) => {
    setIsPreflop(preflop);
    if (preflop) {
      // Clear community cards when switching to preflop
      setFlop([]);
      setTurn(null);
      setRiver(null);
      setRecommendation(null);
    }

  };



  const handleAnalyze = async () => {
    if (holeCards.length !== 2) {
      alert('Please select exactly 2 hole cards');
      return;
    }

    setLoading(true);
    try {
      // Use mock backend only (offline mode)
      console.log('Using mock backend (offline mode)');
      
      // Fallback to mock backend
      const result = await mockAnalyzeHand({
        holeCards,
        flop: isPreflop ? [] : flop,
        turn: isPreflop ? null : turn,
        river: isPreflop ? null : river,
        numPlayers,
        position,
        potSize,
        betSize,
        smallBlind,
        bigBlind,
        stackSize
      });
      
      // Add GTO range analysis from frontend
      const gtoRange = analyzeGTORange(holeCards, position);
      result.gtoRange = gtoRange;
      result.gtoAdvice = getGTOAdvice(gtoRange, position, isPreflop);
      
      setRecommendation(result);
      
      
    } catch (error) {
      console.error('Error analyzing hand:', error);
      alert('Error analyzing hand. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppContainer>
      {process.env.NODE_ENV === 'development' && (
        <DevToggle onClick={() => setShowTestInterface(!showTestInterface)}>
          {showTestInterface ? '🔒 Hide Tests' : '🧪 Show Tests'}
        </DevToggle>
      )}
      
      <MainContent>
        <Header>
          🃏 P_Ker Buddy
          <GameTypeBadge>Texas No-Limit Hold'em</GameTypeBadge>
        </Header>
        <SubHeader>Professional AI-powered decision making for the world's most popular poker game</SubHeader>
        
        <PreflopToggle>
          <ToggleButton 
            active={isPreflop} 
            onClick={() => handlePreflopToggle(true)}
          >
            🃏 Preflop
          </ToggleButton>
          <ToggleButton 
            active={!isPreflop} 
            onClick={() => handlePreflopToggle(false)}
          >
            🃏 Postflop
          </ToggleButton>
        </PreflopToggle>
        
        <TabContainer>
          <TabButton 
            active={activeTab === 'main'} 
            onClick={() => setActiveTab('main')}
          >
            🎯 Main Analysis
          </TabButton>
          <TabButton 
            active={activeTab === 'equity'} 
            onClick={() => setActiveTab('equity')}
          >
            🎯 Equity Calculator
          </TabButton>
          {/* <TabButton 
            active={activeTab === 'icm'} 
            onClick={() => setActiveTab('icm')}
          >
            🏆 Tournament ICM
          </TabButton> */}
          <TabButton 
            active={activeTab === 'history'} 
            onClick={() => setActiveTab('history')}
          >
            📚 Hand History
          </TabButton>
        </TabContainer>
        
        {showTestInterface && <TestInterface />}
        
                {activeTab === 'main' && (
          <>
            <Grid style={{ gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <Section>
                <h2>Game Information</h2>
                <GameInfo
                  numPlayers={numPlayers}
                  position={position}
                  potSize={potSize}
                  betSize={betSize}
                  smallBlind={smallBlind}
                  bigBlind={bigBlind}
                  stackSize={stackSize}
                  onNumPlayersChange={setNumPlayers}
                  onPositionChange={setPosition}
                  onPotSizeChange={setPotSize}
                  onBetSizeChange={setBetSize}
                  onSmallBlindChange={setSmallBlind}
                  onBigBlindChange={setBigBlind}
                  onStackSizeChange={setStackSize}
                />
              </Section>

              <Section>
                <h2>Recommendation {isPreflop && <span style={{color: '#4CAF50', fontSize: '0.8em'}}>(Preflop)</span>}</h2>
                <AIRecommendation
                  recommendation={recommendation}
                  loading={loading}
                  onAnalyze={handleAnalyze}
                  canAnalyze={holeCards.length === 2}
                  isPreflop={isPreflop}
                />
              </Section>

              <Section>
                <h2>Your Hole Cards</h2>
                <CardSelector
                  selectedCards={holeCards}
                  onCardsChange={setHoleCards}
                  maxCards={2}
                  title="Hole Cards"
                />
              </Section>

              <Section>
                <h2>Community Cards {isPreflop && <span style={{color: '#999', fontSize: '0.8em'}}>(Disabled in Preflop)</span>}</h2>
                <BoardSelector
                  flop={flop}
                  turn={turn}
                  river={river}
                  onFlopChange={setFlop}
                  onTurnChange={setTurn}
                  onRiverChange={setRiver}
                  disabled={isPreflop}
                />
              </Section>
            </Grid>
          </>
        )}
        
        {activeTab === 'equity' && (
          <EquityCalculator />
        )}
        
        {/* {activeTab === 'icm' && (
          <TournamentICM />
        )} */}
        
        {activeTab === 'history' && (
          <HandHistory 
            currentHand={recommendation}
            onLoadHand={(hand) => {
              // Load hand data back into the main interface
              setHoleCards(hand.holeCards || []);
              setFlop(hand.flop || []);
              setTurn(hand.turn || null);
              setRiver(hand.river || null);
              setNumPlayers(hand.numPlayers || 6);
              setPosition(hand.position || 'middle');
              setPotSize(hand.potSize || 100);
              setBetSize(hand.betSize || 0);
              setActiveTab('main');
            }}
          />
        )}
      </MainContent>
    </AppContainer>
  );
}

export default App; 