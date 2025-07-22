import React, { useState, createContext, useContext } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import CardSelector from './components/CardSelector';
import BoardSelector from './components/BoardSelector';
import GameInfo from './components/GameInfo';
import AIRecommendation from './components/AIRecommendation';
import TestInterface from './components/TestInterface';
import HandHistory from './components/HandHistory';
import EquityCalculator from './components/EquityCalculator';
import LiveTracking from './components/LiveTracking';
// import TournamentICM from './components/TournamentICM';

import { analyzeGTORange, getGTOAdvice } from './utils/pokerLogic';
import { mockAnalyzeHand } from './mockBackend';

// Theme context
const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Dark and light themes
const lightTheme = {
  primary: '#1e3c72',
  secondary: '#2a5298',
  background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
  surface: 'rgba(255, 255, 255, 0.95)',
  text: '#1e3c72',
  textSecondary: '#666',
  border: '#ddd',
  shadow: 'rgba(0, 0, 0, 0.1)',
  success: '#4CAF50',
  warning: '#ffaa00',
  error: '#ff4444',
  cardBackground: 'white',
  cardBorder: '#ddd',
  inputBackground: '#f8f9fa',
  inputBorder: '#ddd',
  buttonPrimary: 'linear-gradient(45deg, #1e3c72, #2a5298)',
  buttonSecondary: '#f0f0f0',
  buttonText: 'white',
  buttonTextSecondary: '#666'
};

const darkTheme = {
  primary: '#00d4ff',
  secondary: '#0099cc',
  background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
  surface: 'rgba(26, 26, 46, 0.95)',
  text: '#ffffff',
  textSecondary: '#cccccc',
  border: '#333',
  shadow: 'rgba(0, 0, 0, 0.3)',
  success: '#00ff88',
  warning: '#ffaa00',
  error: '#ff4444',
  cardBackground: '#1a1a2e',
  cardBorder: '#333',
  inputBackground: '#2a2a3e',
  inputBorder: '#444',
  buttonPrimary: 'linear-gradient(45deg, #00d4ff, #0099cc)',
  buttonSecondary: '#2a2a3e',
  buttonText: 'white',
  buttonTextSecondary: '#cccccc'
};

// Styled Components with theme support
const AppContainer = styled.div`
  min-height: 100vh;
  background: ${props => props.theme.background};
  padding: 20px;
  font-family: 'Inter', sans-serif;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  transition: all 0.3s ease;
`;

const MainContent = styled.div`
  max-width: 1200px;
  width: 100%;
  background: ${props => props.theme.surface};
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 20px 40px ${props => props.theme.shadow};
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 auto;
  transition: all 0.3s ease;
  
  @media (max-width: 1240px) {
    max-width: calc(100% - 40px);
    margin: 0 20px;
  }
  
  @media (max-width: 768px) {
    max-width: calc(100% - 20px);
    margin: 0 10px;
    padding: 20px;
  }
`;

const Header = styled.h1`
  text-align: center;
  color: ${props => props.theme.text};
  margin-bottom: 10px;
  font-size: 2.5rem;
  font-weight: 700;
  transition: color 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
`;

const LiveIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${props => props.isLive ? 'linear-gradient(45deg, #00ff88, #00cc66)' : 'rgba(255, 255, 255, 0.1)'};
  color: ${props => props.isLive ? '#000' : props.theme.textSecondary};
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  border: 2px solid ${props => props.isLive ? '#00ff88' : props.theme.border};
  animation: ${props => props.isLive ? 'pulse 2s infinite' : 'none'};
  
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.7; }
    100% { opacity: 1; }
  }
`;

const SubHeader = styled.h2`
  text-align: center;
  color: ${props => props.theme.textSecondary};
  margin-bottom: 30px;
  font-size: 1.2rem;
  font-weight: 400;
  transition: color 0.3s ease;
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

const ThemeToggle = styled.button`
  position: fixed;
  top: 20px;
  left: 20px;
  background: ${props => props.theme.buttonPrimary};
  color: ${props => props.theme.buttonText};
  border: none;
  padding: 12px 16px;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  z-index: 1000;
  box-shadow: 0 4px 15px ${props => props.theme.shadow};
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px ${props => props.theme.shadow};
  }
`;

const PreflopToggle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  gap: 15px;
`;

const ToggleButton = styled.button`
  background: ${props => props.active ? props.theme.buttonPrimary : props.theme.buttonSecondary};
  color: ${props => props.active ? props.theme.buttonText : props.theme.buttonTextSecondary};
  border: 2px solid ${props => props.active ? props.theme.primary : props.theme.border};
  padding: 10px 20px;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.active ? 'linear-gradient(45deg, #45a049, #4CAF50)' : props.theme.inputBackground};
    transform: translateY(-1px);
  }
`;

const TabContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  justify-content: center;
`;

const TabButton = styled.button`
  background: ${props => props.active ? props.theme.buttonPrimary : props.theme.buttonSecondary};
  color: ${props => props.active ? props.theme.buttonText : props.theme.buttonTextSecondary};
  border: 2px solid ${props => props.active ? props.theme.primary : props.theme.border};
  padding: 12px 20px;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.active ? 'linear-gradient(45deg, #2a5298, #1e3c72)' : props.theme.inputBackground};
    transform: translateY(-1px);
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: ${props => props.gridTemplateColumns || '1fr 1fr'};
  gap: ${props => props.gap || '20px'};
  width: 100%;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 15px;
  }
`;

const Section = styled.div`
  background: ${props => props.theme.cardBackground};
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 4px 15px ${props => props.theme.shadow};
  border: 1px solid ${props => props.theme.cardBorder};
  transition: all 0.3s ease;
  
  h2 {
    color: ${props => props.theme.text};
    margin-top: 0;
    margin-bottom: 15px;
    font-size: 1.3rem;
    font-weight: 600;
    transition: color 0.3s ease;
  }
`;

const DevToggle = styled.button`
  position: fixed;
  top: 20px;
  right: 20px;
  background: linear-gradient(45deg, #ff6b6b, #ee5a24);
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  font-size: 12px;
  z-index: 1000;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
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
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  
  // Live tracking state - moved to App level to persist across tab changes
  const [isLiveTracking, setIsLiveTracking] = useState(false);
  const [liveTrackingData, setLiveTrackingData] = useState(null);
  const [liveTrackingStats, setLiveTrackingStats] = useState({
    handsProcessed: 0,
    totalWinnings: 0,
    winRate: 0,
    avgPotSize: 0
  });

  const theme = isDarkMode ? darkTheme : lightTheme;

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('darkMode', JSON.stringify(newMode));
  };

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
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme }}>
      <ThemeProvider theme={theme}>
        <AppContainer>
          <ThemeToggle onClick={toggleTheme}>
            {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </ThemeToggle>
          
          {process.env.NODE_ENV === 'development' && (
            <DevToggle onClick={() => setShowTestInterface(!showTestInterface)}>
              {showTestInterface ? '🔒 Hide Tests' : '🧪 Show Tests'}
            </DevToggle>
          )}
          
          <MainContent>
            <Header>
              🃏 P_Ker Buddy
              <GameTypeBadge>Texas No-Limit Hold'em</GameTypeBadge>
              <LiveIndicator isLive={isLiveTracking}>
                {isLiveTracking ? '🔴 LIVE' : '⚪ OFFLINE'}
                {isLiveTracking && ` (${liveTrackingStats.handsProcessed} hands)`}
              </LiveIndicator>
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
              <TabButton 
                active={activeTab === 'live'} 
                onClick={() => setActiveTab('live')}
              >
                📡 Live Tracking
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
                    <h2>Recommendation {isPreflop && <span style={{color: theme.success, fontSize: '0.8em'}}>(Preflop)</span>}</h2>
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
                    <h2>Community Cards {isPreflop && <span style={{color: theme.textSecondary, fontSize: '0.8em'}}>(Disabled in Preflop)</span>}</h2>
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
            
            {activeTab === 'live' && (
              <LiveTracking 
                isTracking={isLiveTracking}
                currentHand={liveTrackingData}
                stats={liveTrackingStats}
                onStartTracking={(provider) => {
                  setIsLiveTracking(true);
                  // Start tracking logic will be handled by LiveTracking component
                }}
                onStopTracking={() => {
                  setIsLiveTracking(false);
                  setLiveTrackingData(null);
                }}
                onHandDataReceived={(handData) => {
                  setLiveTrackingData(handData);
                  // Update stats
                  setLiveTrackingStats(prev => ({
                    handsProcessed: prev.handsProcessed + 1,
                    totalWinnings: prev.totalWinnings + (handData.result === 'win' ? handData.potSize : 0),
                    winRate: ((prev.handsProcessed + 1) / (prev.handsProcessed + 1)) * 100,
                    avgPotSize: Math.round((prev.avgPotSize * prev.handsProcessed + handData.potSize) / (prev.handsProcessed + 1))
                  }));
                }}
                onLoadToAnalysis={(handData) => {
                  // Auto-populate the main analysis with live hand data
                  setHoleCards(handData.holeCards || []);
                  setFlop(handData.communityCards?.slice(0, 3) || []);
                  setTurn(handData.communityCards?.[3] || null);
                  setRiver(handData.communityCards?.[4] || null);
                  setNumPlayers(handData.numPlayers || 6);
                  setPosition(handData.position || 'middle');
                  setPotSize(handData.potSize || 100);
                  setBetSize(handData.betSize || 0);
                  setActiveTab('main');
                }}
              />
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
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}

export default App; 